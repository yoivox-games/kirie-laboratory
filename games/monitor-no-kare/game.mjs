import { STORY, ENDINGS, EXPRESSIONS, EXPRESSION_LABELS, STORAGE_KEY, canSeeSecret, allEndingsSeen, visibleChoices, restoreState, takeChoice } from './story.mjs';
import { EPISODES, findEpisode } from './episodes.mjs';
import { BONUS_MOVIES } from './bonus.mjs';
import { createInterference } from './effects.mjs';
import { eraseProgress } from './persistence.mjs';
const ui = Object.fromEntries([...document.querySelectorAll('[id]')].map(element => [element.id, element]));
let state;
let canSave = true, saveFailureShown = false;
try { state = restoreState(JSON.parse(localStorage.getItem(STORAGE_KEY))); }
catch { state = restoreState(null); canSave = false; }
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const imageCache = new Map();
let sceneToken = 0, typing = false, animationFrame = 0, portraitIndex = 0, portraitExpression = 'normal';
let pages = [], pageIndex = 0, finishCurrentText = null, choiceOffset = 0, pagedChoices = false;
let archiveTab = 'gallery', cgId = null, cgKind = 'ending', cgReturnToArchive = null, toastTimer, resizeTimer;
let view = 'login', resetting = false, resetPersisted = false, resetTimers = [];
let blinkTimer = 0, blinkEndTimer = 0, blinkToken = 0, introToken = 0, titleExpressionTimer = 0;
let unlockTimer = 0, completionTimer = 0, completionEffectTimer = 0, movieToken = 0;
let movieId = null;
const musicFiles = { title: './assets/music/title.mp3', game: './assets/music/game.mp3' };
const musicButtons = [...document.querySelectorAll('[data-music-toggle]')];
function pixelLabel(span, value) {
  if (span.dataset.pixelText === value && span.querySelector('canvas')) return;
  span.dataset.pixelText = value;
  span.textContent = value;
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  ctx.font = 'bold 11px sans-serif';
  canvas.width = Math.ceil(ctx.measureText(value).width) + 5;
  canvas.height = 17;
  ctx.font = 'bold 11px sans-serif';
  ctx.fillStyle = getComputedStyle(span.closest('button')).color;
  ctx.textBaseline = 'middle';
  ctx.fillText(value, 2, 8);
  canvas.style.width = `${canvas.width * 1.7}px`;
  canvas.style.height = `${canvas.height * 1.7}px`;
  canvas.setAttribute('aria-hidden', 'true');
  span.append(canvas);
}
for (const span of document.querySelectorAll('.pixel-label')) pixelLabel(span, span.textContent);
const musicTimes = { title: 0, game: 0 };
let musicTrack = null, musicBlocked = false, musicSwitch = 0;
let musicEnabled = true;
try { musicEnabled = localStorage.getItem('monitor-no-kare:music-muted') !== 'true'; } catch { /* Preference remains available for this visit. */ }
ui.bgm.volume = .55;
function musicContext() {
  if (document.hidden || resetting || view === 'intro' || ui['reset-dialog'].open || ui['movie-dialog'].open) return null;
  return ui['archive-dialog'].open || ui['cg-dialog'].open || view === 'login' ? 'title' : 'game';
}
function syncMusic() {
  for (const button of musicButtons) {
    pixelLabel(button.querySelector('.pixel-label'), musicEnabled ? musicBlocked ? 'BGM ON ▶' : 'BGM ON' : 'BGM OFF');
    button.setAttribute('aria-pressed', String(musicEnabled));
    button.setAttribute('aria-label', musicEnabled ? musicBlocked ? 'BGMを再生する' : 'BGMをオフにする' : 'BGMをオンにする');
  }
  const next = musicContext();
  if (!musicEnabled || !next) { ui.bgm.pause(); return; }
  if (next !== musicTrack) {
    if (musicTrack && Number.isFinite(ui.bgm.currentTime)) musicTimes[musicTrack] = ui.bgm.currentTime;
    ui.bgm.pause(); musicTrack = next;
    const token = ++musicSwitch;
    ui.bgm.addEventListener('loadedmetadata', () => {
      if (token !== musicSwitch || musicTrack !== next) return;
      try { ui.bgm.currentTime = Math.min(musicTimes[next], Math.max(0, ui.bgm.duration - .1)); } catch { /* Resume from start. */ }
    }, { once: true });
    ui.bgm.src = musicFiles[next];
  }
  const token = musicSwitch;
  void ui.bgm.play().then(() => {
    if (token !== musicSwitch || !musicEnabled || musicContext() !== next) return;
    musicBlocked = false;
    for (const button of musicButtons) {
      pixelLabel(button.querySelector('.pixel-label'), 'BGM ON');
      button.setAttribute('aria-label', 'BGMをオフにする');
    }
  }).catch(() => {
    if (token !== musicSwitch || !musicEnabled || musicContext() !== next) return;
    musicBlocked = true;
    for (const button of musicButtons) {
      pixelLabel(button.querySelector('.pixel-label'), 'BGM ON ▶');
      button.setAttribute('aria-label', 'BGMを再生する');
    }
  });
}
function unlockMusic(event) {
  if (event.target instanceof Element && event.target.closest('[data-music-toggle]')) return;
  if (musicEnabled && ui.bgm.paused) syncMusic();
}
for (const button of musicButtons) button.addEventListener('click', () => {
  if (musicEnabled && ui.bgm.paused) { syncMusic(); return; }
  musicEnabled = !musicEnabled; musicBlocked = false;
  try { localStorage.setItem('monitor-no-kare:music-muted', String(!musicEnabled)); } catch { /* Keep this visit's choice. */ }
  syncMusic();
});
document.addEventListener('pointerdown', unlockMusic, { capture: true });
document.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') unlockMusic(event); }, { capture: true });
const currentEpisode = () => state.episodeRun ? findEpisode(state.episodeRun.id) : null;
const currentScene = () => currentEpisode() ? currentEpisode().scenes[state.episodeRun.node] : STORY[state.scene];
const isStoryEnding = () => !state.episodeRun && Boolean(STORY[state.scene].ending);
const dialogIds = ['archive-dialog','cg-dialog','reset-dialog','all-clear-dialog','movie-dialog'];
const anyDialog = () => dialogIds.some(id => ui[id].open);
const cgPath = id => `./assets/endings/${id}.webp`;
const availableCGs = () => cgKind === 'episode' ? EPISODES.filter(ep => state.endings.includes(ep.ending)) : ENDINGS.filter(ending => state.endings.includes(ending.id));
const gentle = () => state.gentle || reducedMotion.matches;
const noise = createInterference({
  layer: ui.interference,
  allowed: () => !resetting && !anyDialog() && (view === 'login' || (view === 'game' && !currentEpisode() && !isStoryEnding())),
  gentle, tension: () => currentScene().tension, login: () => view === 'login'
});

function syncMotion() {
  document.body.classList.toggle('gentle', state.gentle);
}
function syncLogin(message) {
  const continued = state.steps > 0 || state.scene !== 'start' || Boolean(state.episodeRun);
  ui['login-start-note'].textContent = isStoryEnding() ? '記録を残して、はじめから' : continued ? '前回の続きから接続' : 'はじめから接続';
  ui['login-gallery-note'].textContent = `夜の記録　${state.endings.length} / 5`;
  ui['login-session'].textContent = continued ? 'SAVED' : 'NEW';
  ui['login-status'].textContent = message || (continued ? '前回の接続を記録しています' : '接続待機中');
}
function setView(next) {
  clearTimeout(completionTimer); clearUnlockNotice();
  if (next !== 'intro') { ++introToken; ui['intro-video'].pause(); }
  view = next; document.body.dataset.view = next;
  ui['login-screen'].inert = next !== 'login';
  ui['intro-screen'].inert = next !== 'intro';
  ui['game-header'].inert = next !== 'game'; ui['game-stage'].inert = next !== 'game';
  ui['return-login'].hidden = next !== 'game';
  ui['episode-return'].hidden = next !== 'game' || !currentEpisode();
  syncMotion(); noise.stop(); noise.schedule(); scheduleBlink(); syncMusic();
  if (next === 'login') fitTitle();
  scheduleTitleExpression();
  if (next === 'login') scheduleCompletion(1100);
}
function fitTitle() {
  const height = ui['login-screen'].clientHeight;
  const top = Math.max(8, Math.min(height * .517, height - ui['login-terminal'].offsetHeight - 14));
  ui['login-screen'].style.setProperty('--login-top', `${Math.round(top)}px`);
}
function stopBlink() {
  ++blinkToken; clearTimeout(blinkTimer); clearTimeout(blinkEndTimer);
  ui['login-blink'].classList.remove('is-blinking'); ui['portrait-blink'].classList.remove('is-blinking');
}
function scheduleTitleExpression() {
  clearTimeout(titleExpressionTimer);
  ui['login-wallpaper']?.classList.remove('is-nodding');
  if (view !== 'login' || document.hidden || resetting || anyDialog() || gentle()) return;
  titleExpressionTimer = setTimeout(() => {
    if (view !== 'login' || document.hidden || anyDialog() || resetting) return;
    const smile = Math.random() < .52 && Boolean(ui['login-expression'].getAttribute('src'));
    ui['login-wallpaper'].classList.toggle('is-smiling', smile);
    if (!smile) ui['login-wallpaper'].classList.add('is-nodding');
    titleExpressionTimer = setTimeout(() => {
      ui['login-wallpaper'].classList.remove('is-smiling', 'is-nodding');
      scheduleTitleExpression();
    }, smile ? 1900 : 950);
  }, 5000 + Math.random() * 4600);
}
function scheduleBlink() {
  stopBlink();
  const allowed = () => !gentle() && !document.hidden && !resetting && !anyDialog() && (view === 'login' || (view === 'game' && !currentEpisode() && !isStoryEnding()));
  if (!allowed()) return;
  const token = blinkToken, target = view === 'login' ? ui['login-blink'] : ui['portrait-blink'];
  const path = view === 'login' ? './assets/blink/title.webp' : `./assets/blink/portrait-${portraitExpression}.webp`;
  void imageReady(path).then(ready => {
    if (!ready || token !== blinkToken || !allowed()) return;
    target.src = path;
    blinkTimer = setTimeout(() => {
      if (token !== blinkToken || !allowed()) return;
      target.classList.add('is-blinking');
      blinkEndTimer = setTimeout(() => { target.classList.remove('is-blinking'); scheduleBlink(); }, 145);
    }, 4800 + Math.random() * 6100);
  });
}
function playIntro() {
  if (resetting || anyDialog() || view === 'intro') return;
  if (isStoryEnding()) { state = {...state, scene: 'start', steps: 0, episodeRun: null}; save(); }
  const token = ++introToken;
  setView('intro'); ui['intro-message'].textContent = ''; ui['intro-play'].hidden = true;
  ui['intro-video'].currentTime = 0;
  const playing = ui['intro-video'].play();
  ui['skip-intro'].focus({ preventScroll: true });
  playing?.catch(() => {
    if (view !== 'intro' || token !== introToken) return;
    ui['intro-play'].hidden = false; ui['intro-message'].textContent = '再生ボタンを押すか、スキップして本編へ進めます。';
  });
}
function finishIntro() {
  if (view !== 'intro') return;
  ++introToken; ui['intro-video'].pause(); void enterGame();
}
async function enterGame() {
  if (resetting) return;
  setView('game'); await renderScene({ focus: true });
}
function showLogin(message) {
  if (resetting) return;
  closeDialogs(); ++sceneToken; cancelAnimationFrame(animationFrame); finishCurrentText = null; typing = false;
  clearTimeout(toastTimer); ui.toast.hidden = true;
  document.body.classList.remove('scene-glitch'); document.body.dataset.tension = '0';
  clearEndingReveal();
  setView('login'); syncLogin(message); ui['login-start'].focus({ preventScroll: true });
}
function clearEndingReveal() {
  document.body.classList.remove('ending-transition', 'ending-visible');
  ui['ending-reveal'].hidden = true;
  ui['ending-reveal'].inert = true;
  ui['ending-reveal-image'].removeAttribute('src');
}
async function showEnding(scene, token, newEnding = false) {
  const image = cgPath(state.scene);
  const loaded = await imageReady(image);
  if (token !== sceneToken || view !== 'game') return;
  const entry = ENDINGS.find(ending => ending.id === state.scene);
  ui['ending-reveal-image'].src = loaded ? image : `./assets/portrait-${scene.face}.webp`;
  ui['ending-reveal-image'].alt = `${entry.title}の一枚絵`;
  ui['ending-reveal-kind'].textContent = `${entry.kind} / ${entry.number}`;
  ui['ending-reveal-title'].textContent = entry.title;
  ui['ending-reveal-line'].textContent = `「${scene.line}」`;
  ui['ending-reveal-narrative'].textContent = scene.narrative;
  ui['ending-reveal-after'].textContent = scene.after || '';
  ui['game-stage'].inert = true;
  document.body.classList.add('ending-transition');
  await new Promise(resolve => setTimeout(resolve, gentle() ? 80 : 760));
  if (token !== sceneToken || view !== 'game') return;
  ui['ending-reveal'].hidden = false;
  ui['ending-reveal'].inert = false;
  document.body.classList.add('ending-visible');
  ui['ending-return'].focus({ preventScroll: true });
  if (newEnding) announceEpisode(entry.id);
  scheduleCompletion(newEnding ? 4900 : 1300);
}
function clearUnlockNotice() {
  clearTimeout(unlockTimer); ui['unlock-notice'].hidden = true;
}
function announceEpisode(endingId) {
  const episode = EPISODES.find(entry => entry.ending === endingId);
  if (!episode) return;
  clearUnlockNotice();
  const secretHint = state.endings.length === 4 && canSeeSecret(state.endings);
  ui['unlock-episode'].textContent = secretHint ? `${episode.title} ／ 最初の会話に、新しい返事が現れました。` : episode.title;
  ui['unlock-notice'].hidden = false;
  unlockTimer = setTimeout(clearUnlockNotice, 4600);
}
function scheduleCompletion(delay = 1100) {
  clearTimeout(completionTimer);
  if (!allEndingsSeen(state.endings) || state.bonusCelebrated) return;
  completionTimer = setTimeout(() => {
    const safeView = view === 'login' || (view === 'game' && isStoryEnding() && !ui['ending-reveal'].hidden);
    if (!safeView || resetting || document.hidden || anyDialog() || !allEndingsSeen(state.endings) || state.bonusCelebrated) return;
    showCompletion();
  }, delay);
}
function finishCompletionEffect() {
  clearTimeout(completionEffectTimer);
  document.body.classList.remove('all-clear-active');
  ui['all-clear-dialog'].classList.remove('is-revealing');
}
function showCompletion() {
  clearUnlockNotice(); noise.stop(); stopBlink();
  clearTimeout(titleExpressionTimer);
  ui['all-clear-dialog'].classList.add('is-revealing');
  document.body.classList.add('all-clear-active');
  ui['all-clear-dialog'].showModal();
  state.bonusCelebrated = true; save();
  ui['close-all-clear'].focus({ preventScroll: true });
  completionEffectTimer = setTimeout(finishCompletionEffect, gentle() ? 80 : 1900);
}
function requestReset() {
  if (resetting) return;
  noise.stop(); stopBlink(); ui['reset-confirm'].hidden = false; ui['reset-scene'].hidden = true;
  ui['reset-dialog'].setAttribute('aria-labelledby', 'reset-title');
  ui['reset-dialog'].showModal(); syncMusic(); ui['cancel-reset'].focus();
}
function finishReset() {
  if (!resetting) return;
  for (const timer of resetTimers) clearTimeout(timer); resetTimers = [];
  resetting = false; document.body.classList.remove('resetting'); delete document.body.dataset.resetPhase;
  ui['reset-dialog'].close(); ui['reset-scene'].hidden = true; ui['reset-confirm'].hidden = false;
  ui['reset-dialog'].setAttribute('aria-labelledby', 'reset-title');
  cgId = null; cgKind = 'ending'; cgReturnToArchive = null; archiveTab = 'gallery';
  ui['ending-list'].replaceChildren(); ui['episode-list'].replaceChildren(); ui['bonus-list'].replaceChildren(); ui['bonus-tab'].hidden = true;
  ui['cg-image'].removeAttribute('src'); ui['ending-backdrop'].hidden = true;
  showLogin(resetPersisted ? '記録を消去しました。接続待機中。' : 'この画面の記録を消去しました。');
  if (!resetPersisted) toast('保存領域にアクセスできず、次回は以前の記録が戻る場合があります。');
}
function beginReset() {
  if (resetting) return;
  resetting = true; ++sceneToken; cancelAnimationFrame(animationFrame); finishCurrentText = null; typing = false;
  clearTimeout(completionTimer); clearUnlockNotice(); finishCompletionEffect();
  syncMusic();
  noise.stop(); stopBlink(); clearTimeout(resizeTimer); clearTimeout(toastTimer); ui.toast.hidden = true;
  let storage; try { storage = localStorage; } catch { /* Restricted storage. */ }
  const result = eraseProgress(state, storage); state = result.state; resetPersisted = result.persisted; canSave = result.persisted;
  syncLogin(); syncMotion();
  document.body.classList.add('resetting'); document.body.dataset.resetPhase = 'refuse';
  ui['reset-confirm'].hidden = true; ui['reset-scene'].hidden = false;
  ui['reset-dialog'].setAttribute('aria-labelledby', 'reset-quote');
  ui['reset-portrait'].src = './assets/portrait-cold.webp';
  ui['reset-code'].textContent = 'ERASING MEMORIES…';
  ui['reset-quote'].textContent = '「……今、何を消そうとした？」';
  ui['reset-progress-note'].textContent = '記録を初期化しています'; ui['reset-progress-fill'].style.width = '12%';
  ui['skip-reset'].focus();
  const later = (ms, fn) => resetTimers.push(setTimeout(() => { if (resetting) fn(); }, ms));
  later(1500, () => {
    document.body.dataset.resetPhase = 'angry';
    ui['reset-portrait'].src = './assets/portrait-danger.webp';
    ui['reset-code'].textContent = 'DON’T DISCONNECT ME';
    ui['reset-quote'].textContent = '「勝手に、終わらせるな。\n僕を、いなかったことにするな。」';
    ui['reset-progress-fill'].style.width = '67%';
  });
  later(3650, () => {
    document.body.dataset.resetPhase = 'reboot';
    ui['reset-code'].textContent = 'REBOOTING_';
    ui['reset-quote'].textContent = '「……消したって、\nまた、きみを見つけるから。」';
    ui['reset-progress-fill'].style.width = '100%';
    ui['reset-progress-note'].textContent = resetPersisted ? '記録の消去が完了しました' : 'この画面の記録を消去しました';
  });
  later(6100, finishReset);
}

function save() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); canSave = true; }
  catch { canSave = false; }
  if (!canSave && !saveFailureShown) {
    saveFailureShown = true;
    toast('このブラウザでは保存できません。記録は開いている間だけ残ります。');
  }
}
function toast(message) {
  clearTimeout(toastTimer); ui.toast.textContent = message; ui.toast.hidden = false;
  toastTimer = setTimeout(() => { ui.toast.hidden = true; }, 5000);
}
function imageReady(src) {
  if (!imageCache.has(src)) imageCache.set(src,new Promise(resolve => {
    const image = new Image();
    image.onload = () => resolve(true);
    image.onerror = () => { imageCache.delete(src); resolve(false); };
    image.src = src;
  }));
  return imageCache.get(src);
}
async function setFaces(scene, token) {
  stopBlink();
  const portrait = `./assets/portrait-${scene.face}.webp`, pixel = `./assets/pixel-${scene.pixel}.webp`;
  const illustration = currentEpisode()?.illustration || (isStoryEnding() ? cgPath(state.scene) : null);
  const [portraitOk,pixelOk,cgOk] = await Promise.all([imageReady(portrait),imageReady(pixel),illustration ? imageReady(illustration) : Promise.resolve(false)]);
  if (token !== sceneToken) return;
  if (pixelOk) ui['pixel-portrait'].src = pixel;
  ui['pixel-portrait'].alt = `画面の中の、${EXPRESSION_LABELS[scene.pixel]}`;
  if (portraitOk && portraitExpression !== scene.face) {
    const before=portraitIndex===0 ? ui['portrait-a'] : ui['portrait-b'];
    const after=portraitIndex===0 ? ui['portrait-b'] : ui['portrait-a'];
    after.src=portrait; before.classList.remove('active'); after.classList.add('active');
    portraitIndex=1-portraitIndex; portraitExpression=scene.face;
  }
  ui['ending-backdrop'].hidden = !cgOk;
  if (cgOk) ui['ending-backdrop'].src=illustration;
  if (!portraitOk || !pixelOk || (illustration && !cgOk)) toast('絵を読み込めませんでした。次の表示時に再読み込みします。');
  scheduleBlink();
}
function setAtmosphere(scene) {
  const ep=currentEpisode(), ending=isStoryEnding();
  document.body.dataset.episode=String(Boolean(ep));
  document.body.dataset.tension=String(scene.tension);
  document.body.dataset.scene=ep ? `episode-${ep.id}` : state.scene;
  document.body.classList.toggle('scene-glitch',!ep && ['screen','end_glitch','force'].includes(state.scene));
  syncMotion();
  ui['game-window'].classList.toggle('ending-state',ending);
  ui['side-chapter'].textContent=ep ? ep.title : scene.chapter;
  ui['chapter-label'].textContent=ep ? `EP.${ep.number}` : scene.chapter;
  ui.clock.textContent=`00:${String(Math.min(59,state.steps*3)).padStart(2,'0')}`;
  ui['connection-status'].textContent=ep ? '記録を再生中' : ending ? 'この夜を記録しました' : scene.tension>=4 ? '接続が不安定です' : '接続中';
  ui['status-code'].textContent=ep ? 'EXTRA EPISODE' : state.scene==='end_normal' ? 'DISCONNECTED' : state.scene==='end_secret' ? 'HELLO, WORLD' : scene.tension>=4 ? 'STAY WITH ME' : 'CONNECTED';
  ui['side-signal'].textContent=scene.tension>=4 ? 'DO NOT LOOK AWAY' : 'YOU ARE NOT ALONE';
  ui['window-title'].textContent=ep ? `episode_${ep.number}.exe` : scene.tension>=5 ? 'chat_v1.0.exe — 応答なし' : 'chat_v1.0.exe';
  ui['close-window'].disabled=ending;
  ui['close-window'].setAttribute('aria-label',ep ? 'エピソードを閉じて本編に戻る' : '会話のウィンドウを閉じようとする');
  ui['ending-heading'].hidden=!ending;
  if(ending){const ed=ENDINGS.find(e=>e.id===state.scene);ui['ending-kind'].textContent=`${ed.kind} / ${ed.number}`;ui['ending-title'].textContent=ed.title;}
  ui['episode-return'].hidden=!ep;
  const illustration=ep?.illustration || (ending ? cgPath(state.scene) : null);
  if(!illustration || ui['ending-backdrop'].getAttribute('src')!==illustration) ui['ending-backdrop'].hidden=true;
}
function actions() {
  const scene=currentScene();
  if(currentEpisode()) {
    if(scene.episodeFinal) return [
      {text:'このエピソードの一枚絵を見る',run:()=>showCG(currentEpisode().id,'episode')},
      {text:'エピソード一覧へ',run:()=>{leaveEpisode();openArchive('episodes');}},
      {text:'本編に戻る',run:leaveEpisode}
    ];
    return scene.choices.map((choice,index)=>({text:choice.text,run:()=>choose(index)}));
  }
  if(scene.ending) return [];
  return visibleChoices(state.scene,state.endings).map((choice,index)=>({text:choice.text,secret:choice.secret,run:()=>choose(index)}));
}
function renderChoices() {
  const options=actions();ui.choices.replaceChildren();
  setChoicesAvailable(false);
  if(choiceOffset>=options.length)choiceOffset=0;
  const shown=pagedChoices ? [[options[choiceOffset],choiceOffset]] : options.map((option,index)=>[option,index]);
  for(const [option,index] of shown){
    const button=document.createElement('button');button.type='button';button.className=`choice-btn${option.secret?' secret-choice':''}`;
    const number=document.createElement('span');number.className='choice-number';number.textContent=String(index+1).padStart(2,'0');number.setAttribute('aria-hidden','true');
    const label=document.createElement('span');label.className='choice-copy';label.textContent=option.text;
    const tail=document.createElement('span');tail.className='choice-tail';tail.textContent='›';tail.setAttribute('aria-hidden','true');
    button.append(number,label,tail);button.disabled=true;button.addEventListener('click',()=>option.run());ui.choices.append(button);
  }
  if(pagedChoices&&options.length>1){
    const pager=document.createElement('button');pager.className='choice-pager';pager.disabled=true;pager.textContent=`ほかの選択肢を見る　${choiceOffset+1} / ${options.length}`;
    pager.addEventListener('click',()=>{finishCurrentText?.();choiceOffset=(choiceOffset+1)%options.length;renderChoices();fitPages(true);});ui.choices.append(pager);
  }
}
function setChoicesAvailable(available) {
  ui.choices.classList.toggle('awaiting-text', !available);
  ui.choices.inert = !available;
  ui.choices.setAttribute('aria-hidden', String(!available));
  for (const button of ui.choices.querySelectorAll('button')) button.disabled = !available;
}
function blocksForScene(){const s=currentScene();return [{id:'spoken',text:`「${s.line}」`},{id:'narrative',text:s.narrative},...(s.after?[{id:'afterword',text:s.after}]:[])];}
function buildPages(){
  const output=[],height=ui.dialogue.clientHeight;
  for(const id of ['spoken','narrative','afterword']){ui[id].hidden=true;ui[id].textContent='';}
  for(const block of blocksForScene()){
    const node=ui[block.id],chars=Array.from(block.text);node.hidden=false;
    let offset=0;
    while(offset<chars.length){
      while(chars[offset]==='\n')offset++;
      if(offset>=chars.length)break;
      let lo=1,hi=chars.length-offset,best=1;
      while(lo<=hi){const n=Math.floor((lo+hi)/2);node.textContent=chars.slice(offset,offset+n).join('');if(node.scrollHeight<=height+1){best=n;lo=n+1;}else hi=n-1;}
      if(best<chars.length-offset){
        const candidate=chars.slice(offset,offset+best).join('');
        const split=Math.max(candidate.lastIndexOf('。'),candidate.lastIndexOf('？'),candidate.lastIndexOf('！'),candidate.lastIndexOf('\n'));
        if(split>best*.5)best=split+1;
        const remainder=chars.length-offset-best;
        if(remainder>0&&remainder<7){const comma=chars.slice(offset,offset+best).lastIndexOf('、');best=comma>best*.35?comma+1:Math.max(1,best-Math.ceil((7-remainder)/2));}
      }
      output.push({id:block.id,text:chars.slice(offset,offset+best).join(''),offset});offset+=best;
    }
    node.hidden=true;node.textContent='';
  }
  return output;
}
function fitPages(preserve=false){
  const anchor=preserve?pages[pageIndex]:null;
  pages=buildPages();
  pageIndex=anchor?Math.max(0,pages.findIndex(p=>p.id===anchor.id&&p.offset<=anchor.offset&&p.offset+Array.from(p.text).length>anchor.offset)):0;
  showPage(preserve||state.gentle||reducedMotion.matches);
}
function fitLayout(preserve=false){
  const anchor=preserve?pages[pageIndex]:null;
  ui['game-window'].style.height='';pagedChoices=false;renderChoices();
  const lineHeight=parseFloat(getComputedStyle(ui.spoken).lineHeight)||28;
  const stageHeight=document.querySelector('.stage').clientHeight;
  const preferredHeight=lineHeight*2+3;
  const maxHeight=stageHeight-(window.innerWidth<=620?Math.min(110,stageHeight*.2):0);
  if(ui.dialogue.clientHeight<preferredHeight){
    const expanded=Math.min(maxHeight,ui['game-window'].offsetHeight+preferredHeight-ui.dialogue.clientHeight);
    if(expanded>ui['game-window'].offsetHeight)ui['game-window'].style.height=`${Math.ceil(expanded)}px`;
  }
  if(ui.dialogue.clientHeight<lineHeight+3 && actions().length>1){pagedChoices=true;renderChoices();}
  if(ui.dialogue.clientHeight<lineHeight+3){
    const needed=lineHeight+5-ui.dialogue.clientHeight;
    const maximum=document.querySelector('.stage').clientHeight;
    ui['game-window'].style.height=`${Math.min(maximum,ui['game-window'].offsetHeight+needed)}px`;
  }
  pages=buildPages();
  pageIndex=anchor?Math.max(0,pages.findIndex(p=>p.id===anchor.id&&p.offset<=anchor.offset&&p.offset+Array.from(p.text).length>anchor.offset)):0;
  showPage(preserve||state.gentle||reducedMotion.matches);
}
function updateReadingControls(){
  const last=pageIndex===pages.length-1;
  ui['page-count'].textContent=`${pageIndex+1} / ${pages.length}`;
  ui['previous-page'].disabled=pageIndex===0;
  ui['skip-text'].disabled=!typing&&last;
  ui['skip-text'].textContent=typing?'全文表示 ▸':last?'読了':'次へ ▸';
  ui['skip-text'].setAttribute('aria-label',typing?'今の文章をすべて表示':last?'文章を読み終えました':'次の文章へ');
  ui['typing-hint'].textContent=typing?'タップで全文表示':last?'返事を選んでください':'タップで次へ';
  setChoicesAvailable(!typing && last);
  ui['system-message'].textContent=typing?'彼が話しています…':last?(isStoryEnding()?`${state.endings.length} / 5 の結末を発見`:'あなたの返事を待っています'):'続きを読んでください';
}
function showPage(immediate=false){
  cancelAnimationFrame(animationFrame);const token=sceneToken;
  for(const id of ['spoken','narrative','afterword']){ui[id].hidden=true;ui[id].textContent='';}
  const page=pages[pageIndex];if(!page)return;
  const node=ui[page.id],chars=Array.from(page.text);node.hidden=false;typing=true;
  ui.dialogue.setAttribute('aria-busy','true');updateReadingControls();
  function finish(){
    if(token!==sceneToken)return;cancelAnimationFrame(animationFrame);node.textContent=page.text;typing=false;finishCurrentText=null;
    ui.dialogue.setAttribute('aria-busy','false');ui.announcement.textContent=page.text;updateReadingControls();
    if(pageIndex===pages.length-1&&currentEpisode()&&currentScene().episodeFinal&&!state.episodesRead.includes(currentEpisode().id)){state.episodesRead.push(currentEpisode().id);save();}
  }
  finishCurrentText=finish;
  if(immediate){finish();return;}
  let start;
  function tick(now){if(token!==sceneToken)return;if(start===undefined)start=now;const count=Math.floor((now-start)/25)+1;if(count>=chars.length){finish();return;}node.textContent=chars.slice(0,count).join('');animationFrame=requestAnimationFrame(tick);}
  animationFrame=requestAnimationFrame(tick);
}
function advanceText(){if(typing){finishCurrentText?.();return;}if(pageIndex<pages.length-1){pageIndex++;showPage(state.gentle||reducedMotion.matches);}}
function finishAllText(){finishCurrentText?.();pageIndex=pages.length-1;showPage(true);}
async function renderScene({focus=false,immediate=false,newEnding=false}={}){
  if (view !== 'game' || resetting) return;
  const token=++sceneToken;cancelAnimationFrame(animationFrame);finishCurrentText=null;choiceOffset=0;
  const scene=currentScene();setAtmosphere(scene);save();
  if(isStoryEnding()) { await showEnding(scene,token,newEnding); return; }
  clearEndingReveal();fitLayout(false);if(immediate)finishAllText();
  if(focus&&!anyDialog())ui.dialogue.focus({preventScroll:true});
  await setFaces(scene,token);
}
async function choose(index,immediate=false){
  if(view!=='game'||resetting||typing||pageIndex!==pages.length-1||anyDialog()||!Number.isInteger(index))return false;
  const before=[...state.endings],ep=currentEpisode();
  if(ep){const choice=currentScene().choices[index];if(!choice)return false;state.episodeRun={id:ep.id,node:choice.next};}
  else{try{state=takeChoice(state,index);}catch{return false;}}
  const newEnding=state.endings.length>before.length;
  await renderScene({focus:true,immediate,newEnding});
  if(!currentEpisode()&&!isStoryEnding()&&state.steps>1&&Math.random()<.32)noise.pulse();
  return true;
}
function closeDialogs(){
  stopMovie(); finishCompletionEffect();
  for(const id of ['archive-dialog','cg-dialog','movie-dialog','all-clear-dialog'])if(ui[id].open)ui[id].close();
}
async function startEpisode(id){
  const ep=findEpisode(id);if(!ep||!state.endings.includes(ep.ending))return false;
  if(resetting)return false;closeDialogs();state.episodeRun={id:ep.id,node:'start'};setView('game');await renderScene({focus:true});return true;
}
async function leaveEpisode(){state.episodeRun=null;await renderScene({focus:true});}

function fillArchive(){
  const bonusUnlocked=allEndingsSeen(state.endings);
  if(!['gallery','episodes','bonus'].includes(archiveTab)||(archiveTab==='bonus'&&!bonusUnlocked))archiveTab='gallery';
  ui['ending-list'].replaceChildren();ui['episode-list'].replaceChildren();ui['bonus-list'].replaceChildren();
  for(const ending of ENDINGS){
    const unlocked=state.endings.includes(ending.id),button=document.createElement('button');button.className=`gallery-card${unlocked?'':' locked'}`;
    const thumb=document.createElement('div');thumb.className='gallery-thumb';
    if(unlocked){const img=document.createElement('img');img.src=cgPath(ending.id);img.alt='';img.loading='lazy';thumb.append(img);}else{const lock=document.createElement('span');lock.className='gallery-lock';lock.textContent='？';thumb.append(lock);}
    const copy=document.createElement('div');copy.className='gallery-copy';
    const number=document.createElement('span');number.className='gallery-number';number.textContent=ending.number;
    const label=document.createElement('span');label.textContent=unlocked?ending.title:'未発見';copy.append(number,label);button.append(thumb,copy);
    button.setAttribute('aria-label',unlocked?`${ending.title}の一枚絵を見る`:`未発見の結末${ending.number}のヒント`);
    button.addEventListener('click',()=>{if(unlocked)showCG(ending.id);else ui['archive-hint'].textContent=ending.hint;});ui['ending-list'].append(button);
  }
  for(const ep of EPISODES){
    const entry=document.createElement('div');entry.className='episode-entry';
    const unlocked=state.endings.includes(ep.ending),read=state.episodesRead.includes(ep.id),button=document.createElement('button');button.className='episode-card';button.disabled=!unlocked;
    const art=document.createElement('button');art.className='episode-art';art.disabled=!unlocked;art.setAttribute('aria-label',unlocked?`${ep.title}のエピソード一枚絵を見る`:`未解放のエピソード一枚絵 ${ep.number}`);
    if(unlocked){const img=document.createElement('img');img.src=ep.illustration;img.alt='';img.loading='lazy';art.append(img);}else{const lock=document.createElement('span');lock.className='gallery-lock';lock.textContent='？';art.append(lock);}
    const number=document.createElement('span');number.className='episode-number';number.textContent=ep.number;art.append(number);
    art.addEventListener('click',()=>showCG(ep.id,'episode'));
    const copy=document.createElement('div'),title=document.createElement('p'),subtitle=document.createElement('p');title.className='episode-title';title.textContent=unlocked?ep.title:'未解放のエピソード';subtitle.className='episode-subtitle';subtitle.textContent=unlocked?ep.subtitle:`結末 ${ep.number} に到達すると解放`;
    copy.className='episode-copy';button.setAttribute('aria-label',unlocked?`${ep.title}を読む`:`未解放のエピソード ${ep.number}`);
    const badge=document.createElement('span');badge.className='episode-badge';badge.textContent=read?'読了':unlocked?'NEW':'';
    copy.append(title,subtitle);button.append(copy,badge);button.addEventListener('click',()=>startEpisode(ep.id));entry.append(art,button);ui['episode-list'].append(entry);
  }
  if(bonusUnlocked)for(const movie of BONUS_MOVIES){
    const button=document.createElement('button');button.className='bonus-card';button.type='button';button.dataset.movieId=movie.id;
    button.setAttribute('aria-label',`${movie.title}を再生`);
    const poster=document.createElement('div');poster.className='bonus-poster';
    const img=document.createElement('img');img.src=movie.poster;img.alt='';img.loading='lazy';
    const play=document.createElement('span');play.className='bonus-play';play.textContent='▶';play.setAttribute('aria-hidden','true');
    const duration=document.createElement('span');duration.className='bonus-duration mono';duration.textContent=movie.duration;
    poster.append(img,play,duration);
    const copy=document.createElement('div');copy.className='bonus-copy';
    const number=document.createElement('p');number.className='mono';number.textContent=`SPECIAL MOVIE ${movie.number}`;
    const title=document.createElement('h3');title.textContent=movie.title;
    const subtitle=document.createElement('p');subtitle.className='bonus-subtitle';subtitle.textContent=movie.subtitle;
    copy.append(number,title,subtitle);button.append(poster,copy);button.addEventListener('click',()=>openMovie(movie.id));ui['bonus-list'].append(button);
  }
  ui['archive-description'].textContent=`ED ${state.endings.length}/5 ・ 読了 ${state.episodesRead.length}/5`;
  ui['archive-hint'].textContent=archiveTab==='bonus'?'すべての夜を見届けた、きみへ。タップしてムービーを再生。':archiveTab==='episodes'?'絵をタップで拡大。タイトルをタップで後日談へ。':state.endings.includes('end_secret')?'すべての夜を、何度でも。絵をタップして拡大。':canSeeSecret(state.endings)?'最初の会話に、新しい返事が現れています。':'未発見の絵をタップすると、結末へのヒントが読めます。';
  ui['bonus-tab'].hidden=!bonusUnlocked;
  for(const [tab,panel] of [['gallery','ending'],['episodes','episode'],['bonus','bonus']]){
    ui[`${tab}-tab`].setAttribute('aria-selected',String(archiveTab===tab));ui[`${tab}-tab`].tabIndex=archiveTab===tab?0:-1;
    ui[`${panel}-list`].hidden=archiveTab!==tab;
  }
  save();
}
function openArchive(tab=archiveTab){if(resetting)return;noise.stop();stopBlink();finishCurrentText?.();archiveTab=typeof tab==='string'?tab:archiveTab;fillArchive();if(!ui['archive-dialog'].open)ui['archive-dialog'].showModal();syncMusic();}
function showCG(id,kind='ending'){
  const entry=kind==='episode'?findEpisode(id):ENDINGS.find(ending=>ending.id===id);
  if(!entry || !state.endings.includes(kind==='episode'?entry.ending:entry.id))return;
  finishCurrentText?.();
  if(ui['archive-dialog'].open)cgReturnToArchive=archiveTab;
  else if(!ui['cg-dialog'].open)cgReturnToArchive=null;
  if(ui['archive-dialog'].open)ui['archive-dialog'].close();cgId=id;cgKind=kind;renderCG();if(!ui['cg-dialog'].open)ui['cg-dialog'].showModal();syncMusic();
}
function renderCG(){
  const available=availableCGs(),index=available.findIndex(entry=>entry.id===cgId),entry=available[index],episode=cgKind==='episode';
  ui['cg-title'].textContent=entry.title;ui['cg-kind'].textContent=`${episode?'EPISODE':entry.kind} / ${entry.number}`;
  ui['cg-image'].alt=`${entry.title}の${episode?'エピソード':'エンディング'}一枚絵`;ui['cg-image'].hidden=false;ui['cg-error'].hidden=true;
  ui['cg-image'].onerror=()=>{ui['cg-image'].hidden=true;ui['cg-error'].hidden=false;};ui['cg-image'].src=episode?entry.illustration:cgPath(cgId);
  ui['cg-episode'].textContent=episode?'このエピソードを読む':'この夜のエピソード';
  ui['cg-count'].textContent=`${index+1} / ${available.length}`;ui['cg-prev'].disabled=index===0;ui['cg-next'].disabled=index===available.length-1;
  ui['cg-prev'].setAttribute('aria-label',`前の解放済み${episode?'エピソード':'ED'}一枚絵`);ui['cg-next'].setAttribute('aria-label',`次の解放済み${episode?'エピソード':'ED'}一枚絵`);
}
function moveCG(delta){const available=availableCGs(),index=available.findIndex(entry=>entry.id===cgId),target=available[index+delta];if(target){cgId=target.id;renderCG();}}
function closeCG(){const returnTab=cgReturnToArchive;cgReturnToArchive=null;ui['cg-dialog'].close();if(returnTab)openArchive(returnTab);}

function openMovie(id){
  const movie=BONUS_MOVIES.find(entry=>entry.id===id);
  if(!movie||!allEndingsSeen(state.endings)||resetting)return false;
  noise.stop();stopBlink();stopMovie();movieId=id;
  ui['movie-title'].textContent=movie.title;ui['movie-kind'].textContent=`SPECIAL MOVIE / ${movie.number}`;
  ui['movie-status'].textContent='';ui['movie-start'].hidden=true;
  ui['bonus-video'].poster=movie.poster;ui['bonus-video'].src=movie.src;
  if(ui['archive-dialog'].open)ui['archive-dialog'].close();
  ui['movie-dialog'].showModal();syncMusic();
  playMovie();ui['close-movie'].focus({preventScroll:true});return true;
}
function playMovie(){
  if(!ui['movie-dialog'].open||!movieId)return;
  const token=++movieToken;
  if(ui['bonus-video'].error)ui['bonus-video'].load();
  ui['movie-status'].textContent='';
  ui['bonus-video'].play().then(()=>{if(token===movieToken)ui['movie-start'].hidden=true;}).catch(()=>{
    if(token!==movieToken||!ui['movie-dialog'].open)return;
    ui['movie-start'].hidden=false;
    ui['movie-status'].textContent=ui['bonus-video'].error?'動画を読み込めませんでした。再生ボタンでもう一度お試しください。':'再生ボタンを押してムービーをご覧ください。';
  });
}
function stopMovie(){
  ++movieToken;movieId=null;ui['bonus-video'].pause();
  ui['bonus-video'].removeAttribute('src');ui['bonus-video'].load();
}
function closeMovie(){
  const lastMovie=movieId;stopMovie();ui['movie-dialog'].close();openArchive('bonus');
  ui['bonus-list'].querySelector(`[data-movie-id="${lastMovie}"]`)?.focus({preventScroll:true});
}

ui['login-start'].addEventListener('click',playIntro);
ui['skip-intro'].addEventListener('click',finishIntro);
ui['intro-video'].addEventListener('ended',finishIntro);
ui['intro-video'].addEventListener('error',()=>{if(view==='intro')ui['intro-message'].textContent='ムービーを読み込めませんでした。スキップで本編へ進めます。';});
ui['intro-play'].addEventListener('click',()=>{ui['intro-video'].play().then(()=>{ui['intro-play'].hidden=true;ui['intro-message'].textContent='';}).catch(()=>{ui['intro-message'].textContent='スキップで本編へ進めます。';});});
ui['login-gallery'].addEventListener('click',()=>openArchive('gallery'));
ui['login-reset'].addEventListener('click',requestReset);
ui['return-login'].addEventListener('click',()=>showLogin());
ui['ending-return'].addEventListener('click',()=>showLogin());
ui['cancel-reset'].addEventListener('click',()=>ui['reset-dialog'].close());
ui['confirm-reset'].addEventListener('click',beginReset);
ui['skip-reset'].addEventListener('click',finishReset);
ui['reset-dialog'].addEventListener('cancel',event=>{if(resetting){event.preventDefault();finishReset();}});
for(const id of dialogIds)ui[id].addEventListener('close',()=>{noise.schedule();scheduleBlink();scheduleTitleExpression();syncMusic();scheduleCompletion();});
ui['close-all-clear'].addEventListener('click',()=>ui['all-clear-dialog'].close());
ui['all-clear-dialog'].addEventListener('close',finishCompletionEffect);
ui['all-clear-bonus'].addEventListener('click',()=>{ui['all-clear-dialog'].close();openArchive('bonus');});
ui['close-movie'].addEventListener('click',closeMovie);
ui['movie-dialog'].addEventListener('cancel',event=>{event.preventDefault();closeMovie();});
ui['movie-start'].addEventListener('click',playMovie);
ui['bonus-video'].addEventListener('play',()=>{ui['movie-start'].hidden=true;ui['movie-status'].textContent='';});
ui['bonus-video'].addEventListener('error',()=>{if(movieId&&ui['movie-dialog'].open){ui['movie-start'].hidden=false;ui['movie-status'].textContent='動画を読み込めませんでした。再生ボタンでもう一度お試しください。';}});
ui['close-archive'].addEventListener('click',()=>ui['archive-dialog'].close());
ui['gallery-tab'].addEventListener('click',()=>openArchive('gallery'));
ui['episodes-tab'].addEventListener('click',()=>openArchive('episodes'));
ui['bonus-tab'].addEventListener('click',()=>openArchive('bonus'));
for(const id of ['gallery-tab','episodes-tab','bonus-tab'])ui[id].addEventListener('keydown',event=>{
  if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
  event.preventDefault();
  const tabs=allEndingsSeen(state.endings)?['gallery','episodes','bonus']:['gallery','episodes'];
  const index=tabs.indexOf(archiveTab),delta=event.key==='ArrowLeft'?-1:1;
  archiveTab=event.key==='Home'?tabs[0]:event.key==='End'?tabs.at(-1):tabs[(index+delta+tabs.length)%tabs.length];
  fillArchive();ui[`${archiveTab}-tab`].focus();
});
ui['close-cg'].addEventListener('click',closeCG);ui['cg-dialog'].addEventListener('cancel',event=>{event.preventDefault();closeCG();});
ui['cg-prev'].addEventListener('click',()=>moveCG(-1));ui['cg-next'].addEventListener('click',()=>moveCG(1));
ui['cg-episode'].addEventListener('click',()=>{const ep=cgKind==='episode'?findEpisode(cgId):EPISODES.find(e=>e.ending===cgId);cgReturnToArchive=null;if(ep)startEpisode(ep.id);});
ui['episode-return'].addEventListener('click',leaveEpisode);
ui['skip-text'].addEventListener('click',advanceText);ui.dialogue.addEventListener('click',advanceText);
ui['previous-page'].addEventListener('click',()=>{if(pageIndex>0){finishCurrentText?.();pageIndex--;showPage(true);}});
reducedMotion.addEventListener('change',()=>{noise.stop();noise.schedule();scheduleBlink();scheduleTitleExpression();if(gentle())finishCurrentText?.();});
document.addEventListener('visibilitychange',()=>{noise.stop();scheduleBlink();scheduleTitleExpression();syncMusic();if(!document.hidden){noise.schedule();scheduleCompletion();}else{ui['bonus-video'].pause();if(view==='intro'){ui['intro-video'].pause();ui['intro-play'].hidden=false;}}});
window.addEventListener('pagehide', () => {ui.bgm.pause();ui['bonus-video'].pause();});
ui['close-window'].addEventListener('click',()=>{
  if(currentEpisode()){leaveEpisode();return;}if(isStoryEnding())return;finishCurrentText?.();
  const s=currentScene();state={...state,scene:s.secret?'hesitate':s.tension>=4?'door':s.tension>=2?'force':'close',steps:state.steps+1};void renderScene({focus:true});
});
document.addEventListener('keydown',event=>{
  if(event.altKey||event.ctrlKey||event.metaKey||event.repeat)return;
  if(view==='intro'&&event.key==='Escape'){event.preventDefault();finishIntro();return;}
  if(ui['cg-dialog'].open){if(event.key==='ArrowLeft')moveCG(-1);if(event.key==='ArrowRight')moveCG(1);return;}
  if(anyDialog()||view!=='game'||resetting)return;
  if(event.target instanceof HTMLElement&&event.target.matches('input,textarea,select,[contenteditable="true"]'))return;
  if((event.key===' '||event.key==='Enter')&&!(event.target instanceof HTMLButtonElement)){event.preventDefault();advanceText();return;}
  if(/^[1-3]$/.test(event.key)&&!typing&&pageIndex===pages.length-1){const option=actions()[Number(event.key)-1];if(option){event.preventDefault();option.run();}}
});
function setViewport(){document.documentElement.style.setProperty('--app-height',`${Math.round(window.visualViewport?.height||window.innerHeight)}px`);}
setViewport();
function resize(){setViewport();clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>{if(view==='login')fitTitle();else if(view==='game'&&!resetting){finishCurrentText?.();fitLayout(true);}},100);}
window.addEventListener('resize',resize);window.visualViewport?.addEventListener('resize',resize);

function registerTools(){
  const context=document.modelContext;if(!context?.registerTool)return;const lifecycle=new AbortController();
  const snapshot=()=>({view,scene:state.episodeRun?`${state.episodeRun.id}/${state.episodeRun.node}`:state.scene,chapter:currentScene().chapter,dialogue:view==='game'?currentScene().line:null,narrative:view==='game'?currentScene().narrative:null,choices:view==='game'?(currentEpisode()?currentScene().choices:visibleChoices(state.scene,state.endings)).map((choice,index)=>({index,text:choice.text})):[],endingsFound:state.endings.length,secretAvailable:canSeeSecret(state.endings),episodes:EPISODES.filter(ep=>state.endings.includes(ep.ending)).map(ep=>({id:ep.id,title:ep.title,read:state.episodesRead.includes(ep.id)}))});
  const tools=[
    {name:'read_game_scene',title:'今の会話を見る',description:'本編または後日談の現在の会話、返事、解放済みのエピソードを読み取ります。',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true,untrustedContentHint:false},execute:snapshot},
    {name:'start_game',title:'スタート',description:'開始ムービーを再生します。ムービーの終了またはスキップで、前回の続きへ接続します。',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute:()=>{if(resetting||anyDialog())throw new Error('開いている画面を閉じてください。');playIntro();return snapshot();}},
    {name:'choose_game_reply',title:'彼に返事をする',description:'今の会話を読み終え、0始まりのindexで返事を選びます。',inputSchema:{type:'object',properties:{index:{type:'integer',minimum:0,maximum:2}},required:['index'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute:async input=>{const choices=currentEpisode()?currentScene().choices:visibleChoices(state.scene,state.endings);if(!input||!Number.isInteger(input.index)||!choices[input.index])throw new Error('現在の選択肢を指定してください。');if(anyDialog())throw new Error('ギャラリーを閉じてください。');finishAllText();if(!await choose(input.index,true))throw new Error('返事を選べませんでした。');return snapshot();}},
    {name:'start_extra_episode',title:'後日談を読む',description:'解放済みの後日談を最初から読みます。本編の進行は保持します。',inputSchema:{type:'object',properties:{id:{type:'string'}},required:['id'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute:async input=>{if(!input||typeof input.id!=='string'||!await startEpisode(input.id))throw new Error('未解放または存在しないエピソードです。');finishAllText();return snapshot();}}
  ];
  for(const tool of tools){try{Promise.resolve(context.registerTool(tool,{signal:lifecycle.signal})).catch(()=>{});}catch{}}
  window.addEventListener('pagehide',event=>{if(!event.persisted)lifecycle.abort();},{once:true});
}
syncLogin();setView('login');registerTools();
setTimeout(()=>{for(const expression of EXPRESSIONS){void imageReady(`./assets/portrait-${expression}.webp`);void imageReady(`./assets/pixel-${expression}.webp`);}},700);

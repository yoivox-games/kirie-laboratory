import { ART, ROUTES, ENDINGS, NODES, DOSSIER, ILLUSTRATIONS, PORTRAIT_ART, hasIllustration, hasDossier } from './story.js?v=3.2.9';
import { freshRun, enter, advance, choose, rewind, replayEnding, isSecretOpen, clone, validRun } from './engine.js?v=3.2.9';
import { readData, writeData, migrateData, emptyData } from './storage.js?v=3.2.9';
import { Soundscape, musicThemeForNode } from './audio.js?v=3.3.0';
import { isReneOpen, needsReneIntro, visibleEndingIds, BASE_ENDING_IDS, ALL_ENDING_IDS, isSpecialOpen, needsSpecialIntro } from './progression.js?v=3.2.9';
import { playReneUnlock, reneTableau } from './rene-unlock.js?v=3.3.1';
import { playAngelFinale } from './angel-finale.js?v=3.2.9';
import { GAME_TITLE, ROUTE_ORDER, SELECTION, presentationArt, wrapRoute, pickTitleScene, swipeDirection } from './presentation.js?v=3.2.9';
import { createSceneDissolve, galleryItems, adjacentArtwork } from './cinema.js?v=3.2.9';
import { SPECIAL_MOVIES, playSpecialUnlock, specialTableau, startSpecialMovie, bindSpecialMovieControls } from './special.js?v=3.3.3';

Object.assign(ART,presentationArt);
let previousTitle='';try{previousTitle=localStorage.getItem('human-classification-title')||'';}catch{}
const titleScene=pickTitleScene(previousTitle);
try{localStorage.setItem('human-classification-title',titleScene.id);}catch{}

const $=s=>document.querySelector(s),root=$('#screen'),modalRoot=$('#modal-root'),frame=$('#game');
const initial=readData();let data=initial.data,run=null,view='',routeIndex=0,archiveTab='endings',archiveReturn='title';
let typing=null,autoTimer=null,skipTimer=null,toastTimer=null,fullText='',textDone=false,auto=false,skip=false,wasRead=false;
let modalName='',focusBeforeModal=null,confirmFn=null,lastArt='',lastCueNode='',newSecret=false;
let selectionTimer=null,selectionToken=0,swipeStart=null,suppressClickUntil=0;
let angelFinale=null,reneUnlock=null,unlockReturn='title';
let specialUnlock=null,specialReturn='title',movieSession=null;
let sceneDissolve=null,lastChapter='',chapterTimer=null,artSession=null,artSwipe=null,artPan=null;
const motionAllowed=()=>data.settings.motion&&!matchMedia('(prefers-reduced-motion: reduce)').matches&&!skip;
function hideChapter(){clearTimeout(chapterTimer);chapterTimer=null;const card=$('.chapter-card');if(card){card.hidden=true;card.classList.remove('is-visible');}}
function chapterInscription(node){
  if(node.chapter===lastChapter)return;lastChapter=node.chapter;hideChapter();
  if(!motionAllowed()||node.art==='angel-eye-open'||['blackout','whiteout'].includes(node.mood))return;
  const card=$('.chapter-card');if(!card)return;
  card.querySelector('small').textContent=run.route==='r'?'OUTSIDE THE RECORDS':'IMPERIAL ARCHIVE';
  card.querySelector('strong').textContent=node.chapter;card.hidden=false;void card.offsetWidth;card.classList.add('is-visible');
  chapterTimer=setTimeout(hideChapter,3700);
}
const endingTotal=()=>visibleEndingIds(data.completed).length;
const sound=new Soundscape();
const symbols={
  back:'<path d="m14 5-7 7 7 7"/>',close:'<path d="m6 6 12 12M18 6 6 18"/>',next:'<path d="m9 5 7 7-7 7"/>',
  play:'<path d="m9 5 10 7-10 7Z"/>',menu:'<path d="M5 6h14M5 12h14M5 18h14"/>',
  settings:'<path d="M4 7h16M4 17h16"/><circle cx="9" cy="7" r="3" fill="#17171d"/><circle cx="15" cy="17" r="3" fill="#17171d"/>',
  sound:'<path d="m4 9 4 0 5-4v14l-5-4H4Z"/><path d="M17 8q5 4 0 8M19 5q8 7 0 14"/>',
  mute:'<path d="m4 9 4 0 5-4v14l-5-4H4Z"/><path d="m17 9 5 6m0-6-5 6"/>',
  lock:'<rect x="5" y="10" width="14" height="11" rx="1"/><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3"/>',
  book:'<path d="M12 5C8 2 4 3 3 4v15c4-2 6-1 9 1 3-2 5-3 9-1V4c-3-2-6-1-9 1Zm0 0v15"/>',
  save:'<path d="M5 3h12l4 4v14H3V3Zm2 0v7h10V3M7 21v-7h10v7"/>',
  rewind:'<path d="m8 5-5 5 5 5M3 10h11a6 6 0 0 1 0 12" transform="translate(1 -2)"/>',
  skip:'<path d="m3 6 8 6-8 6Zm9 0 8 6-8 6Z"/>',
  pause:'<path d="M8 5v14M16 5v14"/>',home:'<path d="m3 11 9-8 9 8M6 9v12h12V9M10 21v-7h4v7"/>',
  full:'<path d="M3 9V3h6M15 3h6v6M21 15v6h-6M9 21H3v-6"/>',check:'<path d="m5 12 4 4L20 5"/>',
};
const icon=name=>`<svg viewBox="0 0 24 24" aria-hidden="true">${symbols[name]||symbols.next}</svg>`;
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const button=(label,action,extra='',cls='btn')=>`<button class="${cls}" data-action="${action}" ${extra}>${label}</button>`;
const iconButton=(name,label,action,extra='')=>button(icon(name),action,`aria-label="${label}" title="${label}" ${extra}`,'icon-button');
const cropped=art=>['zevran','lucien','konrad','elias','rolf'].includes(art);
function portrait(art,cls=''){return `<div class="portrait ${cropped(art)?'':'uncropped'} ${cls}"><img src="${ART[art]}" alt="${esc(DOSSIER.find(x=>x.art===art)?.name||'場面の風景')}" draggable="false"></div>`;}
const roles={ゼヴラン:'収蔵家',リュシアン:'監査官',コンラート:'司令官',エリアス:'軍医',ロルフ:'魔獣管理官',レネ:'同居人'};
const date=t=>new Intl.DateTimeFormat('ja-JP',{month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit'}).format(t);

function persist(){if(!writeData(data))toast('保存できませんでした。設定から記録を書き出せます。');}
function autosave(){if(run&&!run.replay){data.auto={time:Date.now(),run:clone(run)};persist();}}
function toast(msg){clearTimeout(toastTimer);$('#toast').textContent=msg;$('#toast').classList.add('visible');toastTimer=setTimeout(()=>$('#toast').classList.remove('visible'),3600);}
function clearTimers(){clearInterval(typing);clearTimeout(autoTimer);clearTimeout(skipTimer);typing=null;angelFinale?.cancel();angelFinale=null;reneUnlock?.cancel();reneUnlock=null;specialUnlock?.cancel();specialUnlock=null;}
function pausePlay(){auto=false;skip=false;clearTimeout(autoTimer);clearTimeout(skipTimer);updateToolbar();}
function applySettings(){frame.classList.toggle('reduced-motion',!data.settings.motion);frame.classList.toggle('large-text',data.settings.font===18);frame.style.setProperty('--text-size',data.settings.font+'px');if(movieSession)sound.stop(false,.08);else sound.configure(data.settings);if(!data.settings.motion){angelFinale?.finish();reneUnlock?.finish();specialUnlock?.finish();sceneDissolve?.finish();hideChapter();}}
function activateAudio(event){
  if(document.hidden||movieSession||(!data.settings.music&&!data.settings.effects)||!sound.needsActivation)return;
  if(event?.target?.closest?.('[data-action="sound"],[data-action="toggle-setting"]'))return;
  sound.unlock().then(()=>movieSession?sound.stop(false,.08):sound.configure(data.settings)).catch(()=>{});
}
function stopMovie(resume=false){
  const active=!!movieSession;movieSession?.dispose();movieSession=null;
  if(active&&resume&&!document.hidden&&sound.ctx)sound.unlock().then(()=>{if(!movieSession)sound.configure(data.settings);}).catch(()=>{});
}
function cancelSelection(){clearTimeout(selectionTimer);selectionTimer=null;selectionToken++;$('.route-view')?.classList.remove('is-selecting');}
function changeView(name){stopMovie(true);cancelSelection();swipeStart=null;sceneDissolve?.cancel();sceneDissolve=null;hideChapter();lastChapter='';artSession=null;artSwipe=null;artPan=null;frame.classList.remove('cinema-paused');clearTimers();pausePlay();view=name;lastArt='';modalRoot.innerHTML='';modalName='';frame.removeAttribute('data-modal');root.removeAttribute('inert');}

function showTitle(){
  if(needsReneIntro(data)){showReneReveal('title');return;}
  if(needsSpecialIntro(data)){showSpecialReveal('title');return;}
  changeView('title');sound.setTheme('title');
  const motes=Array.from({length:12},(_,i)=>`<i class="mote" style="left:${12+i*7}%;top:${23+(i*17)%40}%;animation-delay:-${i*.9}s;animation-duration:${8+i%5}s"></i>`).join('');
  root.innerHTML=`<section class="view title-view" data-scene="${titleScene.id}"><div class="portrait uncropped"><img src="${ART[titleScene.id]}" alt="ゼアンブロシア帝国の${titleScene.label}" fetchpriority="high" draggable="false"></div><div class="vignette"></div><div class="motes">${motes}</div><div class="title-rule"></div>
    <div class="title-top"><img class="emblem" src="assets/emblem.svg" alt=""><div class="eyebrow">ZEAMBROSIA<br>IMPERIAL ARCHIVE</div></div>
    <div class="title-tools">${iconButton(data.settings.music?'sound':'mute','音の切り替え','sound')}${iconButton('settings','設定','settings')}</div>
    <p class="vertical-note">${titleScene.caption}</p><p class="title-scene-label">帝国裏面記録 ／ ${titleScene.label}</p>
    <div class="title-body"><div class="title-overline"><p class="eyebrow">CLASSIFICATION: HUMAN</p></div>
      <h1 aria-label="${GAME_TITLE}"><span class="classification-label">飼育区分：</span><span class="classification-human">ニンゲン</span></h1><p class="tagline">あなたの価値は、誰が決める。</p>
      <div class="title-actions">${button('はじめから '+icon('next'),'routes','','btn primary')}${button('続きから','continue',data.auto?'':'disabled','btn secondary')}</div>
      ${isReneOpen(data.completed)?button('記録の外へ　レネ '+icon('next'),'rene-gate','','rene-title-link'):''}
      <div class="title-links">${button('飼育記録','archive','','')}${button('世界と遊び方','about','','')}</div>
      <div class="title-bottom"><span>DARK FANTASY</span><span>${endingTotal()} ENDINGS</span><span>${data.completed.length} / ${endingTotal()}</span></div>
    </div></section>`;
}

function showRoutes(index=routeIndex){
  routeIndex=wrapRoute(index);changeView('routes');
  const id=ROUTE_ORDER[routeIndex],r=ROUTES[id],s=SELECTION[id],locked=id==='m'&&!isSecretOpen(data.completed);sound.setTheme(id);
  root.innerHTML=`<section class="view route-view ${locked?'locked':''}" data-route="${id}" aria-label="ご主人様を選ぶ">
    <header class="route-header"><div class="topbar">${button('TOP','title','aria-label="TOPへ戻る" title="TOPへ戻る"','icon-button top-button')}${iconButton('settings','設定','settings')}</div></header>
    <div class="route-stage" aria-label="左右にスワイプしてご主人様を選ぶ">
      <button class="framed-portrait" data-action="start" data-route="${id}" aria-label="${r.name}を選ぶ" ${locked?'disabled':''}><img class="neutral-expression" src="${ART[s.art]}" alt="${s.alt}" draggable="false"><img class="selected-expression" src="${ART[s.expression]}" alt="" aria-hidden="true" draggable="false"></button>
      ${locked?'<div class="frame-lock" aria-hidden="true">'+icon('lock')+'</div>':''}
      <div class="route-arrows">${iconButton('back','前のルート','route-prev')}${iconButton('next','次のルート','route-next')}</div>
    </div>
    <div class="route-body"><div class="route-heading"><div><div class="route-count">FILE ${r.number} <span>— ${r.role}</span></div><h1 class="route-title">${locked?'閉ざされた記録':r.title}</h1></div></div>
      <p class="route-name">${r.fullName}</p><p class="route-desc">${locked?'ふたつの飼育記録の先に、\nもうひとつの入口がある。':r.description}</p>
      <div class="route-progress"><span>ENDING RECORDS</span>${r.endingIds.map(k=>`<i class="ending-dot ${data.completed.includes(k)?'cleared':''}" aria-label="${data.completed.includes(k)?'到達済み':'未到達'}"></i>`).join('')}<span style="margin-left:auto;margin-right:0">${r.endingIds.filter(k=>data.completed.includes(k)).length} / 3</span></div>
      <p class="selection-voice" role="status"></p>
      ${button(locked?icon('lock')+' 未解放':'このご主人様を選ぶ '+icon('next'),'start',`data-route="${id}" ${locked?'disabled':''}`,'btn primary')}
      <div class="route-foot">${locked?'<p>通常2ルートを各1回クリアで解放</p>':'<p>左右の矢印・スワイプで切り替え</p>'}${button('花の意味','flowers',`data-route="${id}"`,'flower-link')}</div>
    </div></section>`;
}

function startRoute(id){
  if(id==='r'&&!isReneOpen(data.completed)){toast('まだ開かれていない記録です。');return;}
  if(!ROUTES[id]||(id==='m'&&!isSecretOpen(data.completed))){toast('通常2ルートを各1回クリアすると解放されます。');return;}
  const start=()=>{if(id==='r'){run=freshRun('r');enter(run);showStory();}else selectOwner(id);};
  if(data.auto&&!data.auto.run.done)confirmDialog('新しい記録','進行中の自動保存を新しい記録に置き換えます。手動保存した記録は残ります。','はじめる',start);
  else start();
}
function selectOwner(id){
  if(view!=='routes'||ROUTE_ORDER[routeIndex]!==id||$('.route-view').classList.contains('is-selecting'))return;
  const section=$('.route-view'),s=SELECTION[id],token=++selectionToken;
  const reduced=!data.settings.motion||window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  section.querySelectorAll('[data-action="start"]').forEach(b=>b.disabled=true);
  const begin=()=>{
    if(token!==selectionToken||view!=='routes')return;
    section.classList.add('is-selecting');$('.selection-voice').textContent=s.line;
    section.querySelector('.route-body .primary').textContent='所有登録を進めています';
    selectionTimer=setTimeout(()=>{if(token!==selectionToken||view!=='routes')return;run=freshRun(id);enter(run);showStory();},reduced?300:2900);
  };
  const img=section.querySelector('.selected-expression');
  // Slow or failed art loading must never trap navigation or prevent a route starting.
  let done=false;const ready=()=>{if(done||token!==selectionToken)return;done=true;clearTimeout(selectionTimer);begin();};
  selectionTimer=setTimeout(ready,1400);
  if(img.complete)ready();else{img.addEventListener('load',ready,{once:true});img.addEventListener('error',ready,{once:true});}
}
function resume(slot){
  if(slot?.run?.route==='r'&&!isReneOpen(data.completed)){toast('まだ開かれていない記録です。');return;}
  if(!slot||!validRun(slot.run)){toast('この保存データは読み込めません。');return;}
  closeModal();run=clone(slot.run);enter(run);if(run.done)showEnding(false);else showStory();
}

function storyShell(){
  root.innerHTML=`<section class="view story-view"><div class="portrait"><img id="scene-background" alt="" draggable="false" hidden><img id="scene-image" alt="" draggable="false"></div><div class="vignette"></div><div class="scene-mood"></div><div class="angel-white" aria-hidden="true" hidden></div><p class="exhibit-voice" aria-hidden="true" hidden><span>ここは</span><span>あたたかいよ</span></p>
    <div class="story-head"><div><p class="chapter-name" id="chapter"></p><p class="scene-location" id="location"></p></div><div class="right">${iconButton('full','イラストを表示','scene-art')}${iconButton('menu','メニュー','menu')}</div></div>
    <div class="story-progress"><i id="story-progress"></i></div><button class="scene-tap" data-action="next" aria-label="文章を進める"></button>
    <div id="choices" class="choices" hidden></div>
    <div class="dialogue-wrap"><div class="speaker-row"><i class="speaker-mark"></i><span class="speaker-name" id="speaker"></span><span class="speaker-role" id="speaker-role"></span></div><div class="dialogue-line"></div><p id="dialogue" class="dialogue-text"></p><button class="dialogue-hit" data-action="next" aria-label="文章をすべて表示、または次へ"></button><span class="read-label" id="read-label"></span><div class="advance-hint" id="advance-hint"><span>TAP TO CONTINUE</span><i></i></div></div>
    <nav class="story-toolbar" aria-label="ゲーム操作">${button(icon('book')+'履歴','log','','tool')}${button(icon('rewind')+'戻る','rewind','','tool')}${button(icon('save')+'保存','saves','','tool')}${button(icon('play')+'自動','auto','id="auto-tool" aria-pressed="false"','tool')}${button(icon('skip')+'既読','skip','id="skip-tool" aria-pressed="false"','tool')}${button(icon('settings'),'settings','aria-label="設定"','tool')}</nav></section>`;
  const card=document.createElement('div');card.className='chapter-card';card.hidden=true;card.setAttribute('aria-hidden','true');card.innerHTML='<small></small><strong></strong>';$('.story-view').append(card);
  sceneDissolve=createSceneDissolve({portrait:$('#scene-image').parentElement,image:$('#scene-image'),background:$('#scene-background')});
}
function showStory(){
  if(view!=='story'){changeView('story');storyShell();}
  clearTimers();const node=enter(run);sound.setTheme(musicThemeForNode(run.route,node));wasRead=data.seen.includes(node.id);fullText=node.text;textDone=false;
  const section=$('.story-view');section.className=`view story-view ${run.route==='r'?'rene-story':''} art-${node.art} ${node.mood?'mood-'+node.mood:''}`;
  const exhibitVoice=$('.exhibit-voice');exhibitVoice.hidden=node.mood!=='exhibit-voice';
  exhibitVoice.classList.remove('is-speaking');
  if(!exhibitVoice.hidden){void exhibitVoice.offsetWidth;exhibitVoice.classList.add('is-speaking');}
  const angelArt=node.art==='angel-eye-open';
  $('.angel-white').hidden=!angelArt;
  const background=PORTRAIT_ART.has(node.art)?node.background:'',artKey=node.art+'|'+background;
  if(lastArt!==artKey){
    sceneDissolve.set({src:ART[node.art],backgroundSrc:background?ART[background]:'',alt:DOSSIER.find(x=>x.art===node.art)?.name||'場面の風景',
      className:'portrait '+(cropped(node.art)?'':'uncropped')+(background?' has-layers':'')+' scene-'+node.art,
      motion:motionAllowed()&&!angelArt&&!['blackout','whiteout'].includes(node.mood)});
    if(document.hidden||modalName)sceneDissolve.pause();lastArt=artKey;
  }
  chapterInscription(node);
  $('#chapter').textContent=node.chapter;$('#location').textContent=node.location;
  $('#speaker').textContent=node.speaker||(run.route==='r'?'暮らしの記録':'飼育記録');$('#speaker-role').textContent=roles[node.speaker]||'';
  $('#dialogue').className='dialogue-text '+(!node.speaker?'narrator':'');$('#dialogue').textContent='';
  $('#choices').innerHTML='';$('#choices').hidden=true;$('.scene-tap').disabled=false;$('.dialogue-hit').disabled=false;
  $('#advance-hint').style.visibility='hidden';$('#read-label').textContent=run.replay?'回想':wasRead?'既読':'';
  $('#story-progress').style.width=(run.ending?100:Math.min(100,node.progress*100))+'%';
  if(node.cg&&!data.viewedArt.includes(node.cg)){data.viewedArt.push(node.cg);persist();}
  const upcoming=NODES[node.next];if(upcoming&&upcoming.art!==node.art){const preload=new Image();preload.src=ART[upcoming.art];}
  if(node.cue&&lastCueNode!==node.id){lastCueNode=node.id;sound.cue(node.cue);if(data.settings.motion)section.classList.add('cue-'+node.cue);}
  if(skip&&!wasRead){skip=false;toast('未読の文章で停止しました。');}
  if(angelArt&&node.mood==='whiteout'){
    angelFinale=playAngelFinale({section,open:$('#scene-image'),veil:$('.angel-white'),
      motion:data.settings.motion&&!matchMedia('(prefers-reduced-motion: reduce)').matches&&!skip,
      onComplete:()=>{if(view==='story'&&run.node===node.id){updateAdvanceHint();schedulePlayback();}}
    });
    if(document.hidden)angelFinale.pause();
  }
  updateToolbar();autosave();
  if(data.settings.speed===0||skip){finishText();return;}
  const chars=Array.from(fullText);let i=0;
  typing=setInterval(()=>{if(view!=='story')return clearTimers();$('#dialogue').textContent+=chars[i++]||'';if(i>=chars.length)finishText();},data.settings.speed);
}
function finishText(){
  if(view!=='story'||!run)return;clearInterval(typing);typing=null;textDone=true;$('#dialogue').textContent=fullText;
  if(!data.seen.includes(run.node)){data.seen.push(run.node);persist();}
  const node=NODES[run.node];
  if(node.choices?.length){
    pausePlay();$('#choices').innerHTML=node.choices.map((c,i)=>`<button class="choice" data-action="choose" data-index="${i}"><span class="choice-num">0${i+1}</span><span>${esc(c.label)}</span><span class="choice-arrow"></span></button>`).join('');$('#choices').hidden=false;
    $('.scene-tap').disabled=true;$('.dialogue-hit').disabled=true;$('#advance-hint').innerHTML='<span>行動を選んでください</span>';
  }else updateAdvanceHint();
  $('#advance-hint').style.visibility='visible';schedulePlayback();
}
function updateAdvanceHint(){
  const hint=$('#advance-hint');if(!hint||NODES[run?.node]?.choices)return;
  hint.innerHTML='<span>'+(angelFinale?.pending?'TAP TO SKIP':auto?'AUTO':skip?'READ SKIP':'TAP TO CONTINUE')+'</span><i></i>';
}
function schedulePlayback(){
  clearTimeout(autoTimer);clearTimeout(skipTimer);
  if(modalName||view!=='story'||!textDone||NODES[run.node].choices||angelFinale?.pending)return;
  if(skip)skipTimer=setTimeout(next,100);
  else if(auto)autoTimer=setTimeout(next,Math.max(2200,fullText.length*67));
}
function next(){
  if(view!=='story'||modalName||!run)return;
  if(!textDone){finishText();return;}
  if(angelFinale?.pending){angelFinale.finish();return;}
  if(NODES[run.node].choices)return;
  advance(run);if(run.done){completeRun();return;}showStory();
}
function pick(index){if(!textDone||view!=='story'||!NODES[run.node].choices?.[index])return;choose(run,index);showStory();}
function updateToolbar(){
  const a=$('#auto-tool'),s=$('#skip-tool');if(a){a.classList.toggle('active',auto);a.setAttribute('aria-pressed',auto);a.innerHTML=icon(auto?'pause':'play')+'自動';}if(s){s.classList.toggle('active',skip);s.setAttribute('aria-pressed',skip);}
}
function completeRun(){
  clearTimers();pausePlay();const wasOpen=isSecretOpen(data.completed);newSecret=false;
  if(!run.replay&&!data.completed.includes(run.ending)){data.completed.push(run.ending);newSecret=!wasOpen&&isSecretOpen(data.completed);persist();}
  autosave();showEnding(true);if(needsReneIntro(data))showReneReveal('ending');else if(needsSpecialIntro(data))showSpecialReveal('ending');
}
function showEnding(justCompleted){
  changeView('ending');const e=ENDINGS[run.ending];sound.setTheme(musicThemeForNode(e.route,NODES[run.node]));
  root.innerHTML=`<section class="view ending-view ${e.route==='r'?'rene-ending':''}">${portrait(e.art)}<div class="vignette"></div><div class="topbar"><span class="eyebrow">ARCHIVE ${e.number} / ${String(endingTotal()).padStart(2,'0')}</span>${iconButton('settings','設定','settings')}</div>
    <div class="ending-content"><div class="ending-insignia" aria-hidden="true"><img class="emblem ending-seal" src="assets/emblem.svg" alt=""></div><p class="ending-kicker">${ROUTES[e.route].name} ／ END ${ROUTES[e.route].endingIds.indexOf(run.ending)+1}</p><h1>${e.title}</h1><p class="ending-subtitle">${e.subtitle}</p><p class="ending-file">${run.replay?'回想終了':'飼育記録を保存しました'} · ${data.completed.length} / ${endingTotal()}</p>
    ${justCompleted&&newSecret?'<div class="ending-unlock"><span>NEW FILE UNLOCKED</span>シークレット「共同飼育」が解放されました</div>':''}
    <div class="ending-buttons">${justCompleted&&newSecret?button('共同飼育の記録へ '+icon('next'),'secret','','btn primary'):button('飼育記録を見る '+icon('book'),'archive','','btn primary')}
    ${!run.replay&&run.checkpoints.length?button('最後の選択からやり直す','rewind','','btn secondary'):''}${e.route==='r'?button('レネの入口へ','rene-gate','','btn secondary'):''}${button('タイトルへ戻る','title','','btn quiet')}</div></div></section>`;
}

function unlockControls(kind, collection, reference, enterLabel, laterLabel){
  return `<header class="unlock-mast"><div class="unlock-imprint"><img src="assets/emblem.svg" alt=""><span>IMPERIAL ARCHIVE<small>${collection}</small></span></div>
    ${button('演出をスキップ',kind+'-skip','data-unlock-skip','unlock-skip')}<span class="unlock-reference" aria-hidden="true">${reference}</span></header>
    <footer class="unlock-footer"><div class="unlock-meter" aria-hidden="true"><i data-unlock-meter></i></div><p class="unlock-caption" data-unlock-caption role="status"></p>
      <div class="unlock-control-row">${button(enterLabel+' '+icon('next'),kind+'-enter','data-unlock-enter disabled','btn primary')}${button(laterLabel,kind+'-later','','btn quiet')}</div></footer>`;
}
function unlockReady(section,message){
  const enter=section.querySelector('[data-unlock-enter]');
  const skipButton=section.querySelector('[data-unlock-skip]');
  enter.disabled=false;
  section.querySelector('[data-unlock-caption]').textContent=message;
  if(document.activeElement===skipButton)enter.focus({preventScroll:true});
  skipButton.hidden=true;
}

function showReneReveal(from='title'){
  if(!isReneOpen(data.completed))return;
  changeView('rene-unlock');unlockReturn=from;sound.setTheme('r');
  const records=BASE_ENDING_IDS.map(id=>({number:ENDINGS[id].number,title:esc(ENDINGS[id].title)}));
  root.innerHTML=`<section class="view unlock-screen rene-reveal" aria-label="レネルートの解禁演出">
    ${reneTableau(ART['rv1-bg-bedroom'],ART['rv1-bg-dining'],records)}
    ${unlockControls('rene','所有登録記録','FILE 00','レネの記録を開く','あとで読む')}</section>`;
  const section=$('.rene-reveal');
  reneUnlock=playReneUnlock({section,motion:motionAllowed(),initiallyPaused:document.hidden,
    onCue:name=>sound.cue(name),onComplete:()=>unlockReady(section,'裏シナリオが解禁されました')});
}
function acknowledgeReneIntro(){data.reneIntroSeen=true;persist();}
function showReneGate(){
  if(!isReneOpen(data.completed))return;
  changeView('rene-gate');sound.setTheme('r');
  root.innerHTML=`<section class="view rene-gate">${portrait('rene')}<div class="vignette"></div><div class="topbar">${button('TOP','title','aria-label="TOPへ戻る"','icon-button top-button')}${iconButton('settings','設定','settings')}</div>
    <div class="rene-gate-body"><p class="eyebrow">OUTSIDE THE RECORDS / FILE 00</p><h1>レネ・アシュベル</h1><p class="rene-gate-copy">選べる服。同じ高さの椅子。<br>ここには、外へ出る扉だけが見つからない。</p>
    <div class="route-progress"><span>ENDING RECORDS</span>${ROUTES.r.endingIds.map(k=>`<i class="ending-dot ${data.completed.includes(k)?'cleared':''}"></i>`).join('')}<span>${ROUTES.r.endingIds.filter(k=>data.completed.includes(k)).length} / 2</span></div>
    <div class="rene-gate-actions">${button('この暮らしを始める '+icon('next'),'start','data-route="r"','btn primary')}${data.auto?.run.route==='r'?button('レネの続きから','continue','','btn secondary'):''}${button('解禁演出をもう一度','rene-reveal','','btn quiet')}</div></div></section>`;
}

function showSpecialReveal(from='title'){
  if(!isSpecialOpen(data.completed))return;
  changeView('special-unlock');specialReturn=from;sound.setTheme('title');
  root.innerHTML=`<section class="view unlock-screen special-reveal" aria-label="全結末達成の特別演出">
    ${specialTableau(ALL_ENDING_IDS.map(id=>ENDINGS[id]))}
    ${unlockControls('special','帝国映像庫','XI / XI','SPECIALを開く','記録に戻る')}</section>`;
  const section=$('.special-reveal');
  specialUnlock=playSpecialUnlock({section,motion:motionAllowed(),initiallyPaused:document.hidden,
    onCue:name=>sound.cue(name),onComplete:()=>unlockReady(section,'飼育記録にSPECIALが追加されました')});
}
function acknowledgeSpecialIntro(){data.specialIntroSeen=true;persist();}
function showSpecialMovies(content){
  content.innerHTML=`<div class="special-intro"><p class="eyebrow">COMPLETE ARCHIVE / ${ALL_ENDING_IDS.length} ENDINGS</p><h2>帝国の、その向こうへ。</h2><p>十一の結末の先に残された、六つの映像記録。</p>${button('解放演出をもう一度','special-reveal','','special-replay')}</div><div class="special-grid">${SPECIAL_MOVIES.map((movie,i)=>`<button class="special-movie-card" data-action="special-movie" data-id="${movie.id}" aria-label="${esc(movie.title)}を再生"><span class="special-poster"><img src="${movie.poster}" alt="" loading="lazy"><span class="special-play">${icon('play')}</span></span><span class="special-movie-meta"><span>MOVIE ${String(i+1).padStart(2,'0')}</span><span>${movie.duration}</span></span><span class="special-movie-title">${esc(movie.title)}</span><span class="special-movie-description">${esc(movie.description)}</span></button>`).join('')}</div>`;
}
function showSpecialMovie(id){
  if(!isSpecialOpen(data.completed))return;
  const movie=SPECIAL_MOVIES.find(item=>item.id===id);if(!movie)return;
  showModal('movie',esc(movie.title),`<div class="movie-stage"><video id="special-video" src="${movie.src}" poster="${movie.poster}" playsinline preload="none" controlslist="nodownload noremoteplayback nofullscreen" disablepictureinpicture disableremoteplayback draggable="false" aria-label="${esc(movie.title)}"></video><div class="movie-error" hidden><p role="status">動画を読み込めませんでした。<br>通信を確認して、もう一度お試しください。</p><button type="button" class="btn quiet" data-movie-retry>もう一度再生</button></div></div>
    <div class="movie-controls" role="group" aria-label="動画の再生操作">
      <button type="button" class="icon-button movie-toggle" data-movie-play aria-label="再生" title="再生"><span data-off>${icon('play')}</span><span data-on>${icon('pause')}</span></button>
      <div class="movie-progress"><input type="range" data-movie-seek min="0" max="0" step="0.1" value="0" aria-label="再生位置" disabled><span data-movie-time>0:00 / 0:00</span></div>
      <button type="button" class="icon-button movie-toggle" data-movie-mute aria-label="消音" title="消音"><span data-off>${icon('sound')}</span><span data-on>${icon('mute')}</span></button>
      <button type="button" class="icon-button" data-movie-fullscreen aria-label="拡大表示" title="拡大表示">${icon('full')}</button>
    </div><p class="movie-description">${esc(movie.description)}</p>`);
  const dialog=$('.modal'),error=dialog.querySelector('.movie-error');
  dialog.classList.add('movie-modal');sound.stop(false,.08);
  bindSpecialMovieControls(dialog);
  movieSession=startSpecialMovie($('#special-video'),{settings:data.settings,onError:()=>{error.hidden=false;}});
}

function showArchive(tab=archiveTab,from){
  if(tab==='special'&&!isSpecialOpen(data.completed))tab='endings';
  if(from)archiveReturn=from;archiveTab=tab;changeView('archive');sound.setTheme('title');
  const tabs=[['endings','結末'],['art','イラスト'],['people','人物資料'],['world','世界と遊び方']];if(isSpecialOpen(data.completed))tabs.push(['special','SPECIAL']);
  root.innerHTML=`<section class="view archive-view"><div class="archive-header"><div><p class="eyebrow">IMPERIAL RECORDS</p><h1>飼育記録</h1><p>残された結末 ${data.completed.length} / ${endingTotal()}</p></div>${iconButton('close','記録を閉じる','archive-back')}</div>
    <nav class="archive-tabs" aria-label="飼育記録の種類">${tabs.map(([k,t])=>button(t,'archive-tab',`data-tab="${k}"`,[archiveTab===k?'selected':'',k==='special'?'special-tab':''].filter(Boolean).join(' '))).join('')}</nav>
    <div class="archive-scroll" id="archive-content"></div></section>`;
  const content=$('#archive-content'),visibleArt=ILLUSTRATIONS.filter(a=>a.route!=='r'||isReneOpen(data.completed));
  if(tab==='special'){showSpecialMovies(content);const nav=$('.archive-tabs');nav.scrollLeft=nav.scrollWidth-nav.clientWidth;}
  if(tab==='art'){
    const count=visibleArt.filter(a=>hasIllustration(data,a.id)).length,chapterCount=visibleArt.filter(a=>!a.ending).length,endingCount=visibleArt.filter(a=>a.ending&&!a.flashback).length,flashbackCount=visibleArt.filter(a=>a.flashback).length;
    content.innerHTML=`<p class="gallery-note">読み進めた場面のイラストを、拡大・連続表示で見返せます。<br>章の場面 ${chapterCount} 枚・結末 ${endingCount} 枚${flashbackCount?`・回想 ${flashbackCount} 枚`:""} ／ 解放 ${count} / ${visibleArt.length}</p><div class="archive-grid art-grid">${visibleArt.map(a=>{const unlocked=hasIllustration(data,a.id);return `<button class="archive-card" data-action="view-art" data-id="${a.id}" ${unlocked?'':'disabled'} aria-label="${unlocked?esc(a.title):'未解放のイラスト'}"><div class="archive-card-image ${unlocked?'':'locked'}">${unlocked?`<img src="${ART[a.art]}" alt="" loading="lazy">`:`<span class="locked-symbol">${icon('lock')}</span>`}</div><span class="archive-card-title">${unlocked?esc(a.title):'まだ見ていない場面'}</span><span class="archive-card-meta">${ROUTES[a.route].name} ／ ${a.flashback?'FLASHBACK':a.ending?'ENDING':'CHAPTER'}</span></button>`;}).join('')}</div>`;
  }
  if(tab==='endings')content.innerHTML=`<div class="archive-progress"><i style="width:${data.completed.length/endingTotal()*100}%"></i></div><div class="archive-grid">${visibleEndingIds(data.completed).map(id=>{const e=ENDINGS[id];return [id,e];}).map(([id,e])=>{
    const unlocked=data.completed.includes(id);return `<button class="archive-card" data-action="ending-detail" data-id="${id}" aria-label="${unlocked?e.title:ROUTES[e.route].name+' 未発見の結末'}"><div class="archive-card-image ${unlocked?'':'locked'}"><span class="card-number">${e.number} / ${ROUTES[e.route].name}</span>${unlocked?`<img src="${ART[e.art]}" alt="" loading="lazy">`:`<span class="locked-symbol">${icon('lock')}</span>`}</div><span class="archive-card-title">${unlocked?e.title:'未発見の記録'}</span><span class="archive-card-meta">${unlocked?'REPLAY AVAILABLE':'LOCKED'}</span></button>`;}).join('')}</div>`;
  if(tab==='people'){
    const profiles=DOSSIER.filter(person=>!person.hidden||isReneOpen(data.completed));
    content.innerHTML=`<p class="gallery-note">対象ルートの結末に到達すると、その人物の資料が開きます。</p>`+profiles.map((person,index)=>hasDossier(data,person.art)?`<article class="dossier-card" data-person="${person.art}"><div class="dossier-portrait"><img src="${ART[person.art]}" alt="${person.name}" loading="lazy"></div><div><p class="dossier-role">${person.role}</p><h3>${person.name}</h3><p>${person.text}</p></div></article>`:`<article class="dossier-card dossier-locked" aria-label="未解放の人物資料"><div class="dossier-portrait is-secret" aria-hidden="true">${icon('lock')}</div><div><p class="dossier-role">SECRET FILE ${String(index+1).padStart(2,'0')}</p><h3>未解放の人物資料</h3><p>シナリオの先に、まだ開かれていない記録があります。</p></div></article>`).join('');
  }
  if(tab==='world')content.innerHTML=`<div class="about-copy"><h3>飼育区分：ニンゲン</h3><p>高位種アニマ・エレガンスが支配する、ゼアンブロシア帝国。ニンゲンは所有登録を持ち、飼い主の決めた規則の中で暮らしている。</p><h3>タップで進む</h3><p>画面をタップすると文章が進みます。文字の表示中にタップすると、一度に全文を表示します。選択肢が出たら、その場で取る行動を選んでください。</p><p>「自動」は文章を読み終える時間を待って進みます。「既読」は読んだ文章だけを送り、未読・選択肢で停止します。「戻る」は直前の選択をやり直します。</p><h3>3つの記録、9つの結末</h3><p>ゼヴランとリュシアンのルートで、それぞれ1つの結末に到達すると、軍の3人による共同飼育が解放されます。各ルートに3つの結末があります。</p><p>飼い主たちは、それぞれ違うものを評価します。台詞や所作に手掛かりがあります。迷ったときは、結末の記録で「到達の手掛かり」を開いてください。</p>${isReneOpen(data.completed)?'<h3>記録の外へ</h3><p>九つの結末の先に、レネの暮らしが解放されました。タイトルの「記録の外へ」から進めます。レネルートは8章・選択1回・2つの結末です。</p>':''}<h3>保存について</h3><p>進行はこのブラウザへ自動保存されます。手動保存は3枠です。設定の「記録を書き出す」で、結末・進行・設定をまとめて残せます。端末を替える場合やブラウザのデータを消す前に利用してください。</p><p>スマホは縦向きで遊べます。端末のブラウザメニューからホーム画面への追加も利用できます。</p><h3>表現について</h3><p>支配、差別、死を含む物語です。主人公の姿は映さず、残酷な出来事は文章・暗転・音で表現しています。音と演出は設定から変更できます。</p><p class="small">キーボード：Space / Enter で進行、1〜2で選択、Escでメニュー。音楽には専用音源と合成音を使用しています。通信サービスへの接続やAPIキーは必要ありません。</p></div>`;
}

function showModal(name,title,html){
  stopMovie();
  if(view==='routes'&&selectionTimer!==null)showRoutes();
  sceneDissolve?.pause();frame.classList.add('cinema-paused');if(name!=='art'){artSession=null;artSwipe=null;artPan=null;}
  pausePlay();angelFinale?.pause();reneUnlock?.pause();specialUnlock?.pause();if(!modalName)focusBeforeModal=document.activeElement;modalName=name;root.setAttribute('inert','');
  modalRoot.innerHTML=`<div class="modal-backdrop"><section class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><header class="modal-head"><h2 id="modal-title">${title}</h2>${iconButton('close','閉じる','close')}</header><div class="modal-body">${html}</div></section></div>`;
  modalRoot.querySelector('button')?.focus({preventScroll:true});
}
function closeModal(){stopMovie(true);artSession=null;artSwipe=null;artPan=null;modalRoot.innerHTML='';modalName='';root.removeAttribute('inert');confirmFn=null;if(focusBeforeModal?.isConnected)focusBeforeModal.focus({preventScroll:true});focusBeforeModal=null;if(!document.hidden){frame.classList.remove('cinema-paused');sceneDissolve?.resume();angelFinale?.resume();reneUnlock?.resume();specialUnlock?.resume();}}
function viewArt(art,title,background,id){
  if(!ART[art])return;
  const items=id?galleryItems(ILLUSTRATIONS,key=>hasIllustration(data,key),isReneOpen(data.completed)):[{art,title,background}];
  const index=id?items.findIndex(item=>item.id===id):0;if(index<0)return;
  artSession={items,index,zoom:false};drawArt();
}
function drawArt(focusAction){
  if(!artSession)return;const {items,index}=artSession,{art,title,background}=items[index];artSession.zoom=false;
  const layered=PORTRAIT_ART.has(art)&&ART[background];
  showModal('art',esc(title),`<div class="art-viewport" tabindex="0" aria-label="イラスト。拡大するとスクロールで細部を見られます"><figure class="art-figure ${layered?'has-layers':''}">${layered?`<img class="art-background" src="${ART[background]}" alt="">`:''}<img src="${ART[art]}" alt="${esc(title)}" draggable="false"></figure><p class="art-viewer-note" hidden>画像を読み込めませんでした。閉じてからもう一度お試しください。</p></div><footer class="art-viewer-foot"><div class="art-viewer-nav">${iconButton('back','前のイラスト','art-prev',items.length<2?'disabled':'')}<div class="art-viewer-center"><span class="art-index">${String(index+1).padStart(2,'0')} / ${String(items.length).padStart(2,'0')}</span>${button(icon('full')+' 細部を拡大','art-zoom','aria-pressed="false"','art-zoom')}</div>${iconButton('next','次のイラスト','art-next',items.length<2?'disabled':'')}</div><p class="art-viewer-help">${items.length>1?'左右の矢印・スワイプで、解放済みのイラストを鑑賞':'拡大して、細部まで見る'}</p></footer>`);
  $('.modal').classList.add('art-modal');$('.modal-backdrop').classList.add('art-backdrop');
  modalRoot.querySelectorAll('.art-figure img').forEach(img=>img.addEventListener('error',()=>{$('.art-viewer-note')?.removeAttribute('hidden');},{once:true}));
  if(focusAction)modalRoot.querySelector(`[data-action="${focusAction}"]`)?.focus({preventScroll:true});
  if(items.length>1){const preload=new Image();preload.src=ART[items[adjacentArtwork(items,index,1)].art];}
}
function moveArt(direction){
  if(!artSession||artSession.items.length<2)return;
  const focusAction=document.activeElement?.dataset?.action;artSwipe=null;artPan=null;
  artSession.index=adjacentArtwork(artSession.items,artSession.index,direction);drawArt(focusAction);
}
function zoomArt(){
  if(!artSession)return;artSession.zoom=!artSession.zoom;artSwipe=null;artPan=null;
  const viewport=$('.art-viewport'),control=$('[data-action="art-zoom"]');
  viewport.classList.toggle('is-zoomed',artSession.zoom);control.setAttribute('aria-pressed',String(artSession.zoom));control.innerHTML=icon('full')+(artSession.zoom?' 全体を表示':' 細部を拡大');
  viewport.scrollLeft=artSession.zoom?viewport.clientWidth/2:0;viewport.scrollTop=artSession.zoom?viewport.clientHeight/2:0;
}
function confirmDialog(title,text,label,fn){confirmFn=fn;showModal('confirm',title,`<p class="modal-note">${esc(text)}</p><div class="confirm-actions">${button('やめる','close','','btn secondary')}${button(label,'confirm','','btn primary')}</div>`);}
function showMenu(){
  showModal('menu','飼育記録',`<p class="modal-note">${ROUTES[run.route].name} ／ ${NODES[run.node].chapter}<br>進行は自動保存されています。</p><div class="settings-bottom">${button(icon('play')+' 物語に戻る','close','','btn primary')}${button(icon('save')+' 保存・読み込み','saves')}${button(icon('book')+' 会話の履歴','log')}${button(icon('settings')+' 設定','settings')}${button('結末の記録','archive')}${button('タイトルへ','title','','btn quiet')}</div>`);
}
function showSettings(){
  const s=data.settings;
  showModal('settings','設定',`<div class="settings-row"><p class="setting-title">文字の速さ</p><div class="segmented">${[[40,'ゆっくり'],[24,'ふつう'],[12,'はやい'],[0,'一括']].map(([v,t])=>button(t,'setting',`data-key="speed" data-value="${v}"`,s.speed===v?'selected':'')).join('')}</div></div>
    <div class="settings-row"><p class="setting-title">文字の大きさ</p><div class="segmented">${[[14,'小'],[16,'標準'],[18,'大']].map(([v,t])=>button(t,'setting',`data-key="font" data-value="${v}"`,s.font===v?'selected':'')).join('')}</div></div>
    <div class="settings-row"><div class="switch-row"><span>音楽</span>${button('','toggle-setting',`data-key="music" role="switch" aria-label="音楽" aria-checked="${s.music}"`,'switch '+(s.music?'on':''))}</div><div class="switch-row"><span>効果音</span>${button('','toggle-setting',`data-key="effects" role="switch" aria-label="効果音" aria-checked="${s.effects}"`,'switch '+(s.effects?'on':''))}</div><label for="volume">音量 <span id="volume-value">${s.volume}%</span></label><input class="range" id="volume" type="range" min="0" max="100" value="${s.volume}" aria-label="音量"></div>
    <div class="settings-row"><div class="switch-row"><span>光・揺れ・粒子の演出</span>${button('','toggle-setting',`data-key="motion" role="switch" aria-label="光・揺れ・粒子の演出" aria-checked="${s.motion}"`,'switch '+(s.motion?'on':''))}</div></div>
    <div class="settings-bottom">${button(icon('full')+' 全画面を切り替える','fullscreen')}${button('記録を書き出す','export')}${button('記録を読み込む','import')}${button('保存データをすべて消す','reset','','btn danger')}</div><p class="help-text">記録はこのブラウザに保存されます。端末を替えるときは、書き出したファイルを読み込んでください。</p><input type="file" id="save-import" accept="application/json,.json" hidden>`);
}
function showSaves(){
  const slots=[{name:'AUTO SAVE',slot:data.auto,index:-1},...data.slots.map((slot,i)=>({name:'SAVE 0'+(i+1),slot,index:i}))];
  showModal('saves','保存・読み込み',`<p class="modal-note">自動保存に加えて、好きな場面を3つ残せます。</p><div class="save-slots">${slots.map(({name,slot,index})=>`<section class="save-slot"><div class="slot-head"><span>${name}</span><span>${slot?date(slot.time):'—'}</span></div><p class="slot-name">${slot?ROUTES[slot.run.route].name:'まだ記録がありません'}</p><p class="slot-info">${slot?NODES[slot.run.node].chapter+(slot.run.done?' ／ 到達済み':''):'空の保存枠'}</p><div class="slot-actions">${index>=0?button('ここに保存','save-slot',`data-index="${index}" ${!run||run.replay?'disabled':''}`,''):''}${button('読み込む','load-slot',`data-index="${index}" ${!slot?'disabled':''}`,'')}</div></section>`).join('')}</div>`);
}
function showLog(){
  if(!run)return;showModal('log','会話の履歴',run.log.map(x=>`<article class="log-entry ${x.speaker==='選んだ行動'?'is-choice':''}"><span>${esc(x.speaker||x.chapter)}</span><p>${esc(x.text)}</p></article>`).join(''));
  const b=$('.modal-body');b.scrollTop=b.scrollHeight;
}
function endingDetail(id){
  const e=ENDINGS[id],unlocked=data.completed.includes(id);
  showModal('ending-detail','結末の記録',`${unlocked?`<div class="modal-ending-preview"><img src="${ART[e.art]}" alt=""></div>`:''}<p class="modal-ending-role">FILE ${e.number} ／ ${ROUTES[e.route].name}</p><h3 class="modal-ending-title">${unlocked?e.title:'未発見の記録'}</h3><p class="modal-note">${unlocked?e.subtitle:'行動の積み重ねが、結末へつながります。'}</p>${unlocked?button('この結末を読む '+icon('play'),'replay',`data-id="${id}"`,'btn primary'):''}${button('到達の手掛かりを見る','hint',`data-id="${id}"`,'btn quiet')}<div id="ending-hint"></div>`);
}

async function action(el){
  const a=el.dataset.action;if(!a||el.disabled)return;
  if(a!=='next'&&a!=='sound')sound.click();
  switch(a){
    case 'next':next();break;
    case 'choose':pick(Number(el.dataset.index));break;
    case 'title':if(run&&!run.replay)autosave();showTitle();break;
    case 'routes':showRoutes();break;
    case 'route':showRoutes(Number(el.dataset.index));break;
    case 'route-prev':showRoutes(routeIndex-1);break;
    case 'route-next':showRoutes(routeIndex+1);break;
    case 'secret':showRoutes(2);break;
    case 'start':startRoute(el.dataset.route);break;
    case 'flowers':{const s=SELECTION[el.dataset.route];showModal('flowers','額縁に咲く花',s.flowers.map(([name,flower,meaning,copy])=>`<article class="flower-entry"><p>${name}</p><h3>${flower}</h3><strong>「${meaning}」</strong><p>${copy}</p></article>`).join('')+'<p class="help-text">複数ある花言葉のうち、本作の人物像に重なる意味を意匠に取り入れています。</p>');break;}
    case 'continue':resume(data.auto);break;
    case 'menu':showMenu();break;
    case 'close':closeModal();break;
    case 'confirm':{const fn=confirmFn;closeModal();fn?.();break;}
    case 'rene-gate':showReneGate();break;
    case 'rene-reveal':showReneReveal('rene-gate');break;
    case 'rene-skip':reneUnlock?.finish();break;
    case 'rene-enter':if(view==='rene-unlock'&&!reneUnlock?.pending){acknowledgeReneIntro();showReneGate();}break;
    case 'rene-later':{const back=unlockReturn;acknowledgeReneIntro();if(back==='ending'&&run?.done)showEnding(false);else if(back==='rene-gate')showReneGate();else showTitle();break;}
    case 'special-reveal':showSpecialReveal('special');break;
    case 'special-skip':specialUnlock?.finish();break;
    case 'special-enter':if(view==='special-unlock'&&!specialUnlock?.pending){acknowledgeSpecialIntro();showArchive('special',archiveReturn);}break;
    case 'special-later':{const back=specialReturn;acknowledgeSpecialIntro();if(back==='ending'&&run?.done)showEnding(false);else if(back==='special')showArchive('special');else showTitle();break;}
    case 'special-movie':showSpecialMovie(el.dataset.id);break;
    case 'settings':showSettings();break;
    case 'saves':showSaves();break;
    case 'log':showLog();break;
    case 'rewind':{
      if(!run?.checkpoints.length){toast('まだ選択肢に到達していません。');break;}
      confirmDialog('選択の直前へ戻る','直前に選んだ行動をやり直します。すでに見た結末の記録は残ります。','戻る',()=>{rewind(run);showStory();});break;
    }
    case 'auto':if(view!=='story'||NODES[run.node].choices)break;auto=!auto;skip=false;updateToolbar();schedulePlayback();break;
    case 'skip':if(view!=='story'||NODES[run.node].choices)break;if(!data.seen.includes(run.node)){toast('まだ読んでいない文章です。');break;}skip=!skip;auto=false;updateToolbar();if(skip){angelFinale?.finish();sceneDissolve?.finish();hideChapter();}if(skip&&!textDone)finishText();else schedulePlayback();break;
    case 'sound':{const on=!data.settings.music;data.settings.music=on;data.settings.effects=on;await sound.unlock();applySettings();persist();if(view==='title')showTitle();toast(on?'音をONにしました':'音をOFFにしました');break;}
    case 'setting':data.settings[el.dataset.key]=Number(el.dataset.value);applySettings();persist();if(view==='story'&&!textDone)finishText();showSettings();break;
    case 'toggle-setting':data.settings[el.dataset.key]=!data.settings[el.dataset.key];await sound.unlock();applySettings();persist();showSettings();break;
    case 'archive':{const from=view==='story'?'story':'title';showArchive('endings',from);break;}
    case 'about':showArchive('world','title');break;
    case 'archive-tab':showArchive(el.dataset.tab);break;
    case 'scene-art':if(run&&view==='story')viewArt(NODES[run.node].art,NODES[run.node].chapter,NODES[run.node].background);break;
    case 'view-art':{const a=ILLUSTRATIONS.find(x=>x.id===el.dataset.id);if(a&&(a.route!=='r'||isReneOpen(data.completed))&&hasIllustration(data,a.id))viewArt(a.art,a.title,a.background,a.id);break;}
    case 'art-prev':moveArt(-1);break;
    case 'art-next':moveArt(1);break;
    case 'art-zoom':zoomArt();break;
    case 'archive-back':if(archiveReturn==='story'&&run&&!run.done)showStory();else showTitle();break;
    case 'ending-detail':endingDetail(el.dataset.id);break;
    case 'hint':$('#ending-hint').innerHTML=`<p class="hint-box">${ENDINGS[el.dataset.id].hint}</p>`;el.disabled=true;break;
    case 'replay':if(!data.completed.includes(el.dataset.id))break;closeModal();run=replayEnding(el.dataset.id);enter(run);showStory();break;
    case 'save-slot':{
      if(!run||run.replay)break;const i=Number(el.dataset.index),save=()=>{data.slots[i]={time:Date.now(),run:clone(run)};persist();showSaves();toast('保存しました。');};
      if(data.slots[i])confirmDialog('記録を上書き','この保存枠を、今の進行で上書きします。','上書き',save);else save();break;
    }
    case 'load-slot':{const i=Number(el.dataset.index),slot=i<0?data.auto:data.slots[i];if(!slot)break;confirmDialog('記録を読み込む','選んだ記録から再開します。結末の解放状況は残ります。','読み込む',()=>resume(slot));break;}
    case 'fullscreen':try{if(document.fullscreenElement)await document.exitFullscreen();else{await frame.requestFullscreen();try{await screen.orientation?.lock('portrait');}catch{}}}catch{toast('この端末では全画面に切り替えられません。');}break;
    case 'export':{
      const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='good-pet-records.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('記録ファイルを書き出しました。');break;
    }
    case 'import':$('#save-import').click();break;
    case 'reset':confirmDialog('すべての記録を消す','自動保存・手動保存・結末の解放・設定をすべて消します。元に戻せません。','すべて消す',()=>{data=emptyData();run=null;persist();applySettings();showTitle();toast('新しい記録に戻しました。');});break;
  }
}
document.addEventListener('click',e=>{if(Date.now()<suppressClickUntil){e.preventDefault();return;}const el=e.target.closest('button[data-action]');if(el)action(el).catch(()=>toast('操作を完了できませんでした。もう一度お試しください。'));});
document.addEventListener('pointerdown',activateAudio,{passive:true});
document.addEventListener('keydown',activateAudio);
root.addEventListener('pointerdown',e=>{if(view==='routes'&&!modalName&&e.isPrimary&&e.target.closest('.route-stage')&&!e.target.closest('.route-arrows'))swipeStart={x:e.clientX,y:e.clientY,id:e.pointerId};});
root.addEventListener('pointerup',e=>{const start=swipeStart;swipeStart=null;if(!start||start.id!==e.pointerId||view!=='routes'||modalName)return;const direction=swipeDirection(e.clientX-start.x,e.clientY-start.y);if(direction){suppressClickUntil=Date.now()+350;showRoutes(routeIndex+direction);}});
root.addEventListener('pointercancel',()=>{swipeStart=null;});
modalRoot.addEventListener('pointerdown',e=>{
  const viewport=e.target.closest('.art-viewport');if(!viewport||!artSession||!e.isPrimary)return;
  if(artSession.zoom){
    if(e.pointerType==='mouse'){artPan={id:e.pointerId,x:e.clientX,y:e.clientY,left:viewport.scrollLeft,top:viewport.scrollTop,viewport};viewport.setPointerCapture(e.pointerId);e.preventDefault();}
  }else artSwipe={id:e.pointerId,x:e.clientX,y:e.clientY};
});
modalRoot.addEventListener('pointermove',e=>{if(artPan?.id===e.pointerId){artPan.viewport.scrollLeft=artPan.left+artPan.x-e.clientX;artPan.viewport.scrollTop=artPan.top+artPan.y-e.clientY;}});
modalRoot.addEventListener('pointerup',e=>{
  if(artPan?.id===e.pointerId){artPan=null;return;}
  const start=artSwipe;artSwipe=null;if(!start||start.id!==e.pointerId||!artSession||artSession.zoom)return;
  const direction=swipeDirection(e.clientX-start.x,e.clientY-start.y);if(direction){suppressClickUntil=Date.now()+350;moveArt(direction);}
});
modalRoot.addEventListener('pointercancel',()=>{artSwipe=null;artPan=null;});
document.addEventListener('input',e=>{if(e.target.id==='volume'){data.settings.volume=Number(e.target.value);$('#volume-value').textContent=e.target.value+'%';applySettings();persist();}});
document.addEventListener('change',async e=>{
  if(e.target.id!=='save-import'||!e.target.files?.[0])return;
  const file=e.target.files[0];if(file.size>3000000){toast('記録ファイルが大きすぎます。');return;}
  try{const incoming=migrateData(JSON.parse(await file.text()));if(!incoming)throw Error('invalid');confirmDialog('記録を置き換える','現在の保存データを、ファイル内の記録で置き換えます。内容が改稿されたルートの途中データは、新版の冒頭から再開する場合があります。','読み込む',()=>{data=incoming;run=null;persist();applySettings();showTitle();toast('記録を読み込みました。');});}catch{toast('対応する記録ファイルではありません。');}
});
document.addEventListener('keydown',e=>{
  if(modalName){
    if(modalName==='art'&&!artSession?.zoom&&['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();moveArt(e.key==='ArrowRight'?1:-1);return;}
    if(e.key==='Escape'){e.preventDefault();closeModal();return;}
    if(e.key==='Tab'){const items=[...modalRoot.querySelectorAll('button:not(:disabled),input:not([hidden]),video[controls],a[href],[tabindex="0"]')].filter(el=>!el.closest('[hidden]'));const first=items[0],last=items.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}}return;
  }
  if(view==='routes'&&['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();showRoutes(routeIndex+(e.key==='ArrowRight'?1:-1));return;}
  if(view!=='story')return;if(e.target.matches('button,input,select'))return;
  if(e.key==='Escape'){showMenu();return;}
  if([' ','Enter','ArrowRight'].includes(e.key)){e.preventDefault();next();}
  if(['1','2','3'].includes(e.key)&&textDone){const c=NODES[run.node].choices;if(c?.[Number(e.key)-1])pick(Number(e.key)-1);}
});
document.addEventListener('visibilitychange',()=>{if(document.hidden){frame.classList.add('cinema-paused');sceneDissolve?.pause();pausePlay();angelFinale?.pause();reneUnlock?.pause();specialUnlock?.pause();movieSession?.pause();sound.suspend();autosave();}else{if(!modalName){frame.classList.remove('cinema-paused');sceneDissolve?.resume();angelFinale?.resume();reneUnlock?.resume();specialUnlock?.resume();}if(sound.ctx&&!movieSession)sound.unlock().then(()=>applySettings());}});
document.addEventListener('error',e=>{if(e.target instanceof HTMLImageElement){e.target.style.opacity='0';const parent=e.target.parentElement;if(parent.classList.contains('portrait')&&!parent.querySelector('.art-fallback')){const f=document.createElement('div');f.className='art-fallback';f.textContent='画像を読み込めませんでした。物語は続けられます。';parent.append(f);}}},true);
window.addEventListener('pagehide',()=>{movieSession?.pause();autosave();});
applySettings();showTitle();if(initial.error)setTimeout(()=>toast('保存データを読み込めませんでした。記録ファイルがあれば設定から読み込めます。'),500);
if(data.settings.music)activateAudio();
if(initial.migrated){persist();setTimeout(()=>toast(initial.restartedMilitary?'記録を引き継ぎました。改稿された共同ルートの進行は冒頭から再開します。':initial.restartedZevran?'記録を引き継ぎました。改稿されたゼヴランの進行は冒頭から再開します。':initial.restartedLucien?'記録を引き継ぎました。改稿されたリュシアンの進行は冒頭から再開します。':'設定と解放済みの記録を新版へ引き継ぎました。'),600);}

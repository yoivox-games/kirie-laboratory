(() => {
  'use strict';
  if (document.getElementById('kiri-layer')) return;

  const layer = document.createElement('div');
  layer.id = 'kiri-layer';
  layer.className = 'kiri-layer';
  // Separate paper pieces keep the character crisp at any size and let its
  // limbs move without stretching the face. No network resources are used.
  layer.innerHTML = `
    <button type="button" class="kiri-actor" aria-label="余白の住人キリに触れる" data-action="idle">
      <span class="kiri-facing"><svg class="kiri-svg" viewBox="0 0 100 130" aria-hidden="true">
        <defs><linearGradient id="kiri-glass" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#c1d4c5"/><stop offset=".5" stop-color="#7ca79b"/><stop offset="1" stop-color="#40766d"/></linearGradient></defs>
        <path class="kiri-shadow" d="m16 122 34-5 34 6-30 5z"/>
        <g class="kiri-body">
          <path class="kiri-silhouette kiri-foot kiri-foot-left" d="m36 104-4 11-10 5 1 4 20-1 3-17z"/>
          <path class="kiri-silhouette kiri-foot kiri-foot-right" d="m55 105 2 17 19 2 2-5-12-6-2-11z"/>
          <path class="kiri-silhouette" d="m36 64-9 40 13 10 12-6 13 5 11-12-13-38z"/>
          <path class="kiri-cut" d="m48 76-8 17 12 9 12-14-9-15z"/>
          <path d="m47 78-5 14 10 7 10-12-8-12z" fill="url(#kiri-glass)"/>
          <path d="m44 91 14-12-7 17z" fill="#f3f2ed" opacity=".35"/>
          <path class="kiri-fold" d="m34 96 5 7m24-8-5 8"/>
          <path class="kiri-silhouette kiri-arm kiri-arm-left" d="m33 72-12 10-4 15 5 3 8-12 8-6z"/>
          <path class="kiri-silhouette kiri-arm kiri-arm-right" d="m65 71 10 7 9 16-5 7-8-12-10-7z"/>
          <g class="kiri-head">
            <path class="kiri-silhouette" d="m28 42-9-29 13 3 12 21 12-1 7-27 20 10-7 12-8-3-2 14 15 9-3 18-17 12-30-4-15-16 3-12z"/>
            <path class="kiri-fold" d="m22 18 10 14m33-20 12 9-9 5"/>
            <path class="kiri-cut" d="m23 51 15-8 25 1 13 10-6 14-27 4-16-9z"/>
            <g class="kiri-eye-look"><g class="kiri-eyes">
              <path fill="#191b18" d="m34 51 6-1 2 10-6 1z"/>
              <path fill="#191b18" d="m57 49 7 1-1 11-7-1z"/>
            </g></g>
            <path d="m47 64 5 1 3-2" fill="none" stroke="#191b18" stroke-width="1.5"/>
            <path class="kiri-cheek" d="m29 62 7-1 1 3-7 1m34-2 7-1 1 3-7 1" fill="#bb8b4f"/>
          </g>
          <path class="kiri-gift" d="m80 74 13 4-4 17-12-8z" fill="#bc8d51" stroke="#f3f2ed" stroke-width="1"/>
          <path class="kiri-surprise" d="m87 35 4-10m0 15 6-4" fill="none" stroke="#997035" stroke-width="2"/>
        </g>
      </svg></span>
    </button>
    <div class="kiri-speech" aria-hidden="true"></div>
    <button type="button" class="kiri-control" aria-pressed="true">
      <svg viewBox="0 0 16 18" width="12" height="14" aria-hidden="true"><path d="m3 1 3 5h4l3-5 1 12-6 4-6-4z" fill="currentColor"/><path d="M5 9v3m5-3v3" stroke="#f3f2ed" stroke-width="1.5"/></svg>
      <span>キリを休ませる</span>
    </button>
    <span class="kiri-sr-only" role="status" aria-live="polite"></span>`;
  document.body.append(layer);

  const actor = layer.querySelector('.kiri-actor');
  const speech = layer.querySelector('.kiri-speech');
  const control = layer.querySelector('.kiri-control');
  const status = layer.querySelector('[role="status"]');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = matchMedia('(max-width: 600px)');
  const storageKey = 'kirie-kiri-asleep';
  const touchMessages = [
    {text:'……見つかった。', action:'startled'},
    {text:'キリ。ここの、切れはし。', action:'wave'},
    {text:'ひかりのかけら、あげる。', action:'gift'},
    {text:'入口、六つになったんだ。', action:'wave'},
    {text:'No.1はポチ。会いにいってみて。', action:'wave'},
    {text:'No.6はノア。やさしい声がするね。', action:'peek'},
    {text:'この影、ときどき先に歩くんだ。', action:'peek'},
    {text:'きみが来るまで、静かだったよ。', action:'wave'},
    {text:'青い光、ひとつ持っていく？', action:'gift'},
    {text:'しーっ。いま、実験中。', action:'peek'},
    {text:'紙だけど、くすぐったいよ。', action:'startled'},
    {text:'さっきのいたずら、内緒ね。', action:'wave'},
    {text:'切れはしにも、ひみつはある。', action:'peek'},
    {text:'帰り道は、折り目をたどって。', action:'wave'},
    {text:'また来て。余白、あけておく。', action:'wave'}
  ];
  const dialogue = {
    punctuation: ['この「。」、ころがるかな。','句点を、ちょっとだけ借りるね。','転がしたら、どこまでお話が続く？'],
    papers: ['一枚だけ……。','紙の下にも、物語があるんだ。','読んでないよ。めくっただけ。'],
    peek: ['……見てないよ。','ここなら、見つからないはず。','そっちにも、余白ある？'],
    gift: ['落としもの。光のかけら。','今日は、青いのを集めたんだ。','割れても、きれいなままだね。'],
    doze: ['少しだけ、折りたたまれてくる。','夢の中にも、扉がある。','……紙も、眠くなるんだよ。'],
    recall: ['呼んだ？','折り目の向こうから、ただいま。','まだ、きみがいた。']
  };
  let enabled = true;
  try { enabled = localStorage.getItem(storageKey) !== 'yes'; } catch { /* optional preference */ }
  let position = {x: 0, y: 0};
  let controller = null;
  let resumeTimer = 0;
  let speechTimer = 0;
  let step = 0;
  let touches = 0;
  let hovering = false;
  let interacting = false;
  const animations = new Set();
  const size = () => ({w: mobile.matches ? 70 : 86, h: mobile.matches ? 92 : 112});
  const viewport = () => ({w: document.documentElement.clientWidth, h: window.innerHeight});
  const clamp = (n, min, max) => Math.max(min, Math.min(Math.max(min, max), n));
  const transform = p => `translate3d(${p.x}px,${p.y}px,0)`;
  const floor = () => Math.max(0, Math.min(viewport().h - 66, control.getBoundingClientRect().top - 10) - size().h);
  const home = () => ({x: Math.max(8, viewport().w - size().w - 25), y: floor()});
  const setAction = name => { actor.dataset.action = name; };
  const face = right => actor.style.setProperty('--kiri-facing', right ? '1' : '-1');
  function placeControl() {
    control.style.left = '';
    control.style.right = '';
    const box = control.getBoundingClientRect();
    const coversLink = [...document.querySelectorAll('a')].some(link => {
      const r = link.getBoundingClientRect();
      return r.width && r.left < box.right && r.right > box.left && r.top < box.bottom && r.bottom > box.top;
    });
    if (coversLink) { control.style.left = '12px'; control.style.right = 'auto'; }
  }
  function place(p) {
    position = p;
    actor.style.transform = transform(p);
    placeSpeech();
  }
  function placeSpeech() {
    const width = speech.offsetWidth || 170;
    const height = speech.offsetHeight || 36;
    const x = clamp(position.x + size().w / 2 - width / 2, 12, viewport().w - width - 12);
    speech.style.transform = transform({x, y: Math.max(12, position.y - height - 9)});
    speech.style.setProperty('--speech-tip', `${clamp(position.x + size().w / 2 - x, 12, width - 18)}px`);
  }
  function say(text, announce = false) {
    clearTimeout(speechTimer);
    speech.textContent = text;
    placeSpeech();
    speech.dataset.visible = 'true';
    if (announce) status.textContent = text;
    speechTimer = setTimeout(() => { speech.dataset.visible = 'false'; }, 2800);
  }
  function sayAny(lines) {
    say(lines[Math.floor(Math.random() * lines.length)]);
  }
  function wait(ms, signal) {
    return new Promise((resolve, reject) => {
      if (signal.aborted) return reject(new DOMException('Cancelled', 'AbortError'));
      const aborted = () => { clearTimeout(timer); reject(new DOMException('Cancelled', 'AbortError')); };
      const timer = setTimeout(() => { signal.removeEventListener('abort', aborted); resolve(); }, ms);
      signal.addEventListener('abort', aborted, {once:true});
    });
  }
  async function animate(element, frames, options, signal) {
    if (signal.aborted) throw new DOMException('Cancelled', 'AbortError');
    const animation = element.animate(frames, options);
    animations.add(animation);
    const aborted = () => animation.cancel();
    signal.addEventListener('abort', aborted, {once:true});
    try { await animation.finished; }
    finally { signal.removeEventListener('abort', aborted); animations.delete(animation); animation.cancel(); }
  }
  function cancel() {
    clearTimeout(resumeTimer);
    clearTimeout(speechTimer);
    // Preserve the current position when a visitor catches Kiri mid-step.
    const rect = actor.getBoundingClientRect();
    controller?.abort();
    controller = null;
    animations.forEach(animation => animation.cancel());
    animations.clear();
    layer.querySelectorAll('.kiri-chip').forEach(chip => chip.remove());
    if (!actor.hidden) place({x: rect.x, y: rect.y});
    actor.style.opacity = '';
    speech.dataset.visible = 'false';
    setAction('idle');
    interacting = false;
  }
  const canRoam = () => enabled && !reduced.matches && !document.hidden && !hovering && !actor.matches(':focus-visible');
  function later(ms = 1500) {
    clearTimeout(resumeTimer);
    if (canRoam()) resumeTimer = setTimeout(start, ms);
  }
  async function walk(x, signal) {
    const target = {x: clamp(x, 10, viewport().w - size().w - 10), y: floor()};
    face(target.x >= position.x);
    setAction('walk');
    const duration = clamp(Math.abs(target.x - position.x) * 12, 1000, 4200);
    speech.dataset.visible = 'false';
    await animate(actor, [{transform:transform(position)}, {transform:transform(target)}], {duration, easing:'linear'}, signal);
    place(target);
    setAction('idle');
  }
  async function foldTo(target, signal) {
    const origin = transform(position);
    await animate(actor, [{transform:origin, opacity:1}, {transform:`${origin} scaleY(.04)`, opacity:0}], {duration:230,easing:'ease-in'}, signal);
    place(target);
    await animate(actor, [{transform:`${transform(target)} scaleY(.04)`,opacity:0}, {transform:transform(target),opacity:1}], {duration:350,easing:'ease-out'}, signal);
  }
  function visibleRect(element) {
    if (!element) return null;
    const rect = element.getBoundingClientRect();
    return rect.width && rect.top > 100 && rect.bottom < viewport().h - 100 ? rect : null;
  }
  async function punctuation(signal) {
    const dot = document.querySelector('.title-stop');
    const rect = visibleRect(dot);
    if (!rect) return false;
    await foldTo({x:clamp(rect.left + rect.width * .16, 12, viewport().w - size().w - 12),y:rect.bottom - size().h + 5}, signal);
    face(false);
    await wait(450, signal);
    setAction('poke');
    sayAny(dialogue.punctuation);
    await animate(dot, [
      {transform:'translateX(0) rotate(0deg)'},
      {transform:'translateX(12px) rotate(22deg)',offset:.25},
      {transform:'translateX(20px) rotate(42deg)',offset:.45},
      {transform:'translateX(9px) rotate(16deg)',offset:.7},
      {transform:'translateX(0) rotate(0deg)'}
    ], {duration:1900,easing:'ease-in-out'}, signal);
    setAction('idle');
    await wait(900, signal);
    await foldTo(home(), signal);
    return true;
  }
  async function papers(signal) {
    const book = document.querySelector('.paper.front');
    const rect = visibleRect(book);
    if (!rect) return false;
    await foldTo({x:clamp(rect.right - 8, 12, viewport().w - size().w - 12),y:rect.bottom - size().h}, signal);
    face(false);
    setAction('poke');
    sayAny(dialogue.papers);
    await animate(book, [{transform:'rotate(-12deg)'},{transform:'rotate(-19deg)',offset:.3},{transform:'rotate(-7deg)',offset:.6},{transform:'rotate(-12deg)'}],{duration:1800,easing:'ease-in-out'},signal);
    setAction('startled');
    await wait(900, signal);
    await foldTo(home(), signal);
    return true;
  }
  async function peek(signal) {
    const fromLeft = Math.random() > .5;
    const x = fromLeft ? -size().w * .3 : viewport().w - size().w * .7;
    await foldTo({x,y:clamp(viewport().h * .53,100,floor())}, signal);
    face(fromLeft);
    setAction('peek');
    sayAny(dialogue.peek);
    await wait(2300, signal);
    await foldTo(home(), signal);
  }
  async function confetti(signal) {
    setAction('gift');
    await wait(700, signal);
    const base = {x:position.x + size().w * .7,y:position.y + size().h * .63};
    await Promise.all([0,1,2].map(async index => {
      const chip = document.createElement('i');
      chip.className = 'kiri-chip';
      chip.setAttribute('aria-hidden','true');
      layer.append(chip);
      try {
        const dx = (index - 1) * 38;
        await animate(chip,[
          {transform:`${transform(base)} rotate(0deg)`,opacity:0},
          {transform:`${transform({x:base.x+dx*.55,y:base.y-35-index*6})} rotate(40deg)`,opacity:.75,offset:.3},
          {transform:`${transform({x:base.x+dx,y:base.y+28})} rotate(110deg)`,opacity:.55,offset:.8},
          {transform:`${transform({x:base.x+dx+4,y:base.y+36})} rotate(130deg)`,opacity:0}
        ], {duration:1700+index*130,easing:'ease-out'},signal);
      } finally { chip.remove(); }
    }));
    setAction('idle');
  }
  async function roam(signal) {
    while (!signal.aborted) {
      const action = step++ % 6;
      if (action === 0) {
        if (!await punctuation(signal) && !await papers(signal)) {
          await walk(viewport().w * .2, signal);
          sayAny(dialogue.gift);
          await confetti(signal);
        }
      } else if (action === 1 || action === 3) {
        await walk((action === 1 ? .2 : .67) * viewport().w, signal);
      } else if (action === 2) {
        await peek(signal);
      } else if (action === 4) {
        sayAny(dialogue.gift);
        await confetti(signal);
      } else {
        setAction('doze');
        sayAny(dialogue.doze);
        await wait(3000, signal);
        setAction('idle');
      }
      await wait(2100 + Math.random() * 1300, signal);
    }
  }
  function run(task) {
    const current = new AbortController();
    controller = current;
    task(current.signal).catch(error => {
      if (error.name !== 'AbortError') console.warn('Kiri paused:', error);
    }).finally(() => {
      if (controller === current) {
        controller = null;
        interacting = false;
        setAction('idle');
        later();
      }
    });
  }
  function start() {
    if (!canRoam()) return;
    cancel();
    run(roam);
  }
  function updateControl() {
    control.setAttribute('aria-pressed',String(enabled));
    control.querySelector('span').textContent = enabled ? 'キリを休ませる' : 'キリを呼ぶ';
    actor.hidden = !enabled;
  }
  control.addEventListener('click', () => {
    cancel();
    enabled = !enabled;
    try { localStorage.setItem(storageKey,enabled ? 'no' : 'yes'); } catch { /* optional preference */ }
    updateControl();
    place(home());
    if (enabled) {
      sayAny(dialogue.recall);
      status.textContent = speech.textContent;
      later(2000);
    }
    else status.textContent = 'キリはお休み中です。';
  });
  actor.addEventListener('click', () => {
    cancel();
    touches++;
    const reaction = touchMessages[(touches - 1) % touchMessages.length];
    say(reaction.text,true);
    if (reduced.matches) return;
    interacting = true;
    run(async signal => {
      if (reaction.action === 'gift') await confetti(signal);
      else { setAction(reaction.action); await wait(2200,signal); }
      await wait(1000,signal);
    });
  });
  actor.addEventListener('pointerenter', event => {
    if (event.pointerType !== 'mouse') return;
    hovering = true;
    if (!interacting) { cancel(); setAction('peek'); }
  });
  actor.addEventListener('pointerleave', event => {
    if (event.pointerType !== 'mouse') return;
    hovering = false;
    if (!interacting) later();
  });
  actor.addEventListener('focus', () => { if (actor.matches(':focus-visible')) cancel(); });
  actor.addEventListener('blur', () => { if (!interacting) later(); });
  // Eyes follow nearby visitors; there is no continuous JavaScript render loop.
  window.addEventListener('pointermove', event => {
    if (!enabled || reduced.matches || event.pointerType !== 'mouse') return;
    const direction = Number(actor.style.getPropertyValue('--kiri-facing')) || 1;
    actor.style.setProperty('--look-x',`${clamp((event.clientX - position.x - size().w/2)/100,-2,2)*direction}px`);
    actor.style.setProperty('--look-y',`${clamp((event.clientY - position.y - size().h/2)/130,-1.5,1.5)}px`);
  },{passive:true});
  function settle() {
    cancel();
    hovering = false;
    placeControl();
    place(home());
    step = 0;
    later(1600);
  }
  window.addEventListener('resize',settle,{passive:true});
  window.addEventListener('scroll',settle,{passive:true});
  document.addEventListener('visibilitychange', () => { if(document.hidden) cancel(); else settle(); });
  reduced.addEventListener('change',settle);
  window.addEventListener('pagehide',cancel);
  window.addEventListener('pageshow',event => { if (event.persisted) settle(); });
  placeControl();
  place(home());
  face(false);
  updateControl();
  if (enabled) { say('余白の住人、キリ。さわってみて。'); later(3200); }
})();

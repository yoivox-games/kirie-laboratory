(() => {
  'use strict';
  const root = document.documentElement;
  const button = document.getElementById('fullscreen');
  const media = ['(display-mode: fullscreen)', '(display-mode: standalone)'].map(query => window.matchMedia(query));
  let hintTimer;
  const active = () => document.fullscreenElement || document.webkitFullscreenElement;
  const standalone = () => media.some(query => query.matches) || window.navigator?.standalone === true;
  function update() {
    const expanded = !!active();
    root.classList.toggle('is-immersive', expanded || standalone());
    if (!button) return;
    button.hidden = standalone() && !expanded;
    button.setAttribute('aria-pressed', String(expanded));
    button.setAttribute('aria-label', expanded ? '全画面表示を終了' : '全画面で遊ぶ');
    button.title = expanded ? '全画面表示を終了' : '全画面で遊ぶ';
  }
  function hint() {
    const toast = document.getElementById('toast');
    if (!toast) return;
    clearTimeout(hintTimer);
    toast.textContent = 'この画面では全画面表示にできません。ブラウザーで開くか、ホーム画面に追加して遊んでね。';
    toast.hidden = false;
    hintTimer = setTimeout(() => { toast.hidden = true; }, 6500);
  }
  async function enter(manual = true) {
    if (active() || standalone()) { update(); return true; }
    const request = root.requestFullscreen || root.webkitRequestFullscreen;
    if (!request) { if (manual) hint(); return false; }
    try {
      // Call before any await so the player's tap supplies browser user activation.
      await request.call(root, { navigationUI: 'hide' });
      update();
      if (!active() && manual) hint();
      return !!active();
    } catch {
      if (manual) hint();
      return false;
    }
  }
  async function toggle() {
    if (!active()) return enter(true);
    const exit = document.exitFullscreen || document.webkitExitFullscreen;
    if (!exit) { hint(); return false; }
    try { await exit.call(document); update(); return true; }
    catch { hint(); return false; }
  }
  if (button) button.onclick = toggle;
  document.addEventListener('fullscreenchange', update);
  document.addEventListener('webkitfullscreenchange', update);
  for (const query of media) query.addEventListener?.('change', update);
  window.addEventListener('pageshow', update);
  window.NoahFullscreen = Object.freeze({ enter, toggle });
  update();
})();

// Brief, low-contrast signal interruptions. No sound, external requests, or flashing loop.
export function createInterference({ layer, allowed, gentle, tension, login }) {
  let timer = 0, endTimer = 0;
  function clearPulse() {
    clearTimeout(endTimer);
    layer.classList.remove('active');
    document.body.classList.remove('signal-drop');
  }
  function pulse() {
    if (!allowed() || gentle() || document.hidden) return false;
    clearPulse();
    layer.style.setProperty('--tear-position', `${18 + Math.random() * 64}%`);
    layer.classList.add('active');
    document.body.classList.add('signal-drop');
    endTimer = setTimeout(clearPulse, 640);
    return true;
  }
  function schedule() {
    clearTimeout(timer);
    if (gentle() || document.hidden) { clearPulse(); return; }
    const base = login() ? 8500 : Math.max(10000, 19000 - tension() * 1400);
    timer = setTimeout(() => { pulse(); schedule(); }, base + Math.random() * 8000);
  }
  function stop() { clearTimeout(timer); clearPulse(); }
  return { pulse, schedule, stop };
}

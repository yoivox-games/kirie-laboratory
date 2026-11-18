(() => {
  const Audio = window.AudioContext || window.webkitAudioContext;
  const controls = document.querySelector('.music-inline');
  if (!Audio || !controls) return;

  const toggle = controls.querySelector('.music-toggle');
  const volume = controls.querySelector('input');
  const caption = controls.querySelector('.music-caption');
  const title = caption.textContent;
  const volumeKey = 'kirie-music-volume';
  const floatingStop = document.createElement('button');
  floatingStop.type = 'button';
  floatingStop.className = 'music-floating';
  floatingStop.textContent = '音楽を止める';
  floatingStop.hidden = true;
  document.body.append(floatingStop);

  let context;
  let gain;
  let source;
  let bufferPromise;
  let state = 'paused';
  let attempt = 0;
  let pauseTimer;
  let controlsVisible = true;
  try {
    const stored = localStorage.getItem(volumeKey);
    if (stored !== null && /^(100|[1-9]?[0-9])$/.test(stored)) volume.value = stored;
  } catch {}

  function render(nextState) {
    state = nextState;
    const playing = state === 'playing';
    const loading = state === 'loading';
    controls.dataset.state = state;
    toggle.setAttribute('aria-pressed', String(playing));
    toggle.setAttribute('aria-busy', String(loading));
    toggle.disabled = loading;
    toggle.querySelector('span').textContent = loading ? '音楽を準備中' : playing ? '音楽を止める' : '音楽を聴く';
    floatingStop.hidden = !playing || controlsVisible;
    document.body.classList.toggle('music-active', playing);
  }

  function setLevel(value, timeConstant) {
    const now = context.currentTime;
    if (gain.gain.cancelAndHoldAtTime) gain.gain.cancelAndHoldAtTime(now);
    else gain.gain.cancelScheduledValues(now);
    gain.gain.setTargetAtTime(value, now, timeConstant);
  }

  async function loadBuffer(audioContext) {
    const parts = ['room-01.part', 'room-02.part', 'room-03.part', 'room-04.part'];
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 20000);
    try {
      const buffers = await Promise.all(parts.map(async name => {
        const response = await fetch('assets/audio/' + name, { signal: controller.signal });
        if (!response.ok) throw new Error('Audio unavailable');
        return response.arrayBuffer();
      }));
      // Decode once so part boundaries never interrupt the loop.
      const encoded = await new Blob(buffers, {type: 'audio/mpeg'}).arrayBuffer();
      return await audioContext.decodeAudioData(encoded);
    } finally {
      clearTimeout(timeout);
      controller.abort();
    }
  }

  async function play() {
    const id = ++attempt;
    clearTimeout(pauseTimer);
    render('loading');
    caption.textContent = title;
    try {
      if (!context || context.state === 'closed') {
        context = new Audio();
        source = null;
        bufferPromise = null;
        gain = context.createGain();
        gain.gain.value = 0;
        gain.connect(context.destination);
      }
      // Resume inside the user's gesture, before waiting for the audio.
      const resumed = context.resume();
      bufferPromise ??= loadBuffer(context);
      const [, buffer] = await Promise.all([resumed, bufferPromise]);
      if (id !== attempt) return;
      if (!source) {
        source = context.createBufferSource();
        source.buffer = buffer;
        source.loop = true;
        source.loopEnd = buffer.duration;
        source.connect(gain);
        source.start();
        controls.dataset.loopDuration = buffer.duration.toFixed(5);
      }
      setLevel(Number(volume.value) / 100, .18);
      render('playing');
    } catch {
      if (id !== attempt) return;
      bufferPromise = null;
      if (context?.state === 'running') context.suspend().catch(() => {});
      caption.textContent = '音楽を読み込めませんでした。もう一度お試しください。';
      render('paused');
    }
  }

  function pause(immediate = false) {
    ++attempt;
    clearTimeout(pauseTimer);
    render('paused');
    if (!context || context.state === 'closed') return;
    setLevel(0, .02);
    const suspend = () => context.suspend().catch(() => {});
    if (immediate) suspend();
    else pauseTimer = window.setTimeout(suspend, 130);
  }

  toggle.addEventListener('click', () => state === 'playing' ? pause() : play());
  floatingStop.addEventListener('click', () => pause());
  volume.addEventListener('input', () => {
    if (state === 'playing') setLevel(Number(volume.value) / 100, .025);
    try { localStorage.setItem(volumeKey, volume.value); } catch {}
  });
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(([entry]) => {
      controlsVisible = entry.isIntersecting;
      floatingStop.hidden = state !== 'playing' || controlsVisible;
    });
    observer.observe(toggle);
  } else {
    controlsVisible = false;
  }
  window.addEventListener('pagehide', () => pause(true));
  controls.hidden = false;
  render('paused');
})();

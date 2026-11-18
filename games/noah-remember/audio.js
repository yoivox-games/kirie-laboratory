(() => {
  class NoahSound {
    constructor() {
      this.context = null;
      this.enabled = true;
      this.volume = 0.42;
      this.timer = null;
      this.noteIndex = 0;
    }
    async start() {
      if (!this.enabled) return;
      const Audio = window.AudioContext || window.webkitAudioContext;
      if (!Audio) return;
      if (!this.context) {
        this.context = new Audio();
        const ctx = this.context;
        this.master = ctx.createGain();
        this.master.gain.value = this.volume;
        this.master.connect(ctx.destination);
        this.reverb = ctx.createConvolver();
        const impulse = ctx.createBuffer(2, Math.floor(ctx.sampleRate * 3), ctx.sampleRate);
        for (let channel = 0; channel < 2; channel++) {
          const data = impulse.getChannelData(channel);
          for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 3) * 0.55;
        }
        this.reverb.buffer = impulse;
        const wet = ctx.createGain();
        wet.gain.value = 0.24;
        this.reverb.connect(wet);
        wet.connect(this.master);
        [73.42, 110, 146.83].forEach((frequency, i) => {
          const oscillator = ctx.createOscillator();
          const gain = ctx.createGain();
          oscillator.type = 'sine';
          oscillator.frequency.value = frequency;
          gain.gain.value = [0.018, 0.009, 0.007][i];
          oscillator.connect(gain);
          gain.connect(this.master);
          oscillator.start();
        });
        const room = ctx.createBuffer(1, ctx.sampleRate * 4, ctx.sampleRate);
        const data = room.getChannelData(0);
        let last = 0;
        for (let i = 0; i < data.length; i++) {
          last = (last + (Math.random() * 2 - 1) * 0.02) / 1.02;
          data[i] = last * 0.17;
        }
        const noise = ctx.createBufferSource();
        noise.buffer = room;
        noise.loop = true;
        const noiseGain = ctx.createGain();
        noiseGain.gain.value = 0.08;
        noise.connect(noiseGain);
        noiseGain.connect(this.master);
        noise.start();
      }
      await this.context.resume();
      this.master.gain.setTargetAtTime(this.volume, this.context.currentTime, 0.4);
      if (!this.timer) {
        this.playMelodyNote();
        this.timer = setInterval(() => this.playMelodyNote(), 1900);
      }
    }
    playMelodyNote() {
      if (!this.enabled || this.context?.state !== 'running') return;
      const melody = [74, null, 81, 77, null, 76, 72, null, 69, null, 74, 77, null, 76, null, null];
      const note = melody[this.noteIndex++ % melody.length];
      if (note) {
        const frequency = 440 * Math.pow(2, (note - 69) / 12);
        this.tone(frequency, 2.7, 0.065, 'sine');
        this.tone(frequency * 2.005, 1.5, 0.01, 'sine');
      }
    }
    tone(frequency, duration, level, type = 'sine', delay = 0, endFrequency = null) {
      if (!this.enabled || !this.context || this.context.state !== 'running') return;
      const ctx = this.context;
      const at = ctx.currentTime + delay;
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, at);
      if (endFrequency) oscillator.frequency.exponentialRampToValueAtTime(endFrequency, at + duration);
      gain.gain.setValueAtTime(0.0001, at);
      gain.gain.exponentialRampToValueAtTime(level, at + 0.035);
      gain.gain.exponentialRampToValueAtTime(0.0001, at + duration);
      oscillator.connect(gain);
      gain.connect(this.master);
      gain.connect(this.reverb);
      oscillator.start(at);
      oscillator.stop(at + duration + 0.05);
    }
    noise(duration, level, frequency, delay = 0) {
      if (!this.enabled || !this.context || this.context.state !== 'running') return;
      const ctx = this.context;
      const buffer = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * duration), ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * Math.sin(Math.PI * i / data.length) * Math.pow(1 - i / data.length, 1.5);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = frequency;
      filter.Q.value = 1.7;
      const gain = ctx.createGain();
      gain.gain.value = level;
      source.connect(filter);
      filter.connect(gain);
      gain.connect(this.master);
      gain.connect(this.reverb);
      source.start(ctx.currentTime + delay);
    }
    effect(name) {
      switch (name) {
        case 'chair':
          this.noise(0.8, 0.35, 470);
          this.tone(190, 0.7, 0.045, 'triangle', 0.05, 140);
          break;
        case 'metal':
        case 'lock':
          [670, 1190, 1683].forEach((frequency, i) => this.tone(frequency, 0.65 - i * 0.1, 0.032, 'sine', i * 0.045));
          if (name === 'lock') this.noise(0.16, 0.2, 700, 0.2);
          break;
        case 'cup':
          this.tone(820, 0.4, 0.035);
          this.noise(0.16, 0.09, 390);
          break;
        case 'door':
          this.tone(78, 1.1, 0.12, 'sine', 0, 35);
          this.noise(0.45, 0.2, 140);
          break;
        case 'steps':
          [0, 0.55, 1.1].forEach(delay => {
            this.noise(0.16, 0.18, 230, delay);
            this.tone(85, 0.22, 0.045, 'sine', delay, 45);
          });
          break;
        case 'bird':
          this.tone(1770, 0.23, 0.012, 'sine', 0, 2300);
          this.tone(2300, 0.16, 0.009, 'sine', 0.3, 1700);
          break;
        case 'distant':
          this.noise(0.2, 0.18, 520);
          this.tone(185, 0.18, 0.032, 'triangle', 0, 110);
          break;
        case 'thud':
          this.tone(65, 0.9, 0.13, 'sine', 0, 26);
          break;
        case 'select':
          this.tone(690, 0.16, 0.015);
          break;
      }
    }
    setEnabled(value) {
      this.enabled = value;
      if (value) this.start().catch(() => {});
      else if (this.context) this.master.gain.setTargetAtTime(0, this.context.currentTime, 0.2);
    }
    setVolume(value) {
      this.volume = value;
      if (this.context && this.enabled) this.master.gain.setTargetAtTime(value, this.context.currentTime, 0.15);
    }
    pause() {
      if (this.context?.state === 'running') this.context.suspend().catch(() => {});
    }
  }
  window.NoahSound = NoahSound;
})();

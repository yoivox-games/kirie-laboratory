// Browser-local music and effects. Supplied recordings have separate scene scopes.
export const RENE_TRACK=new URL('./assets/audio/rene-cosmic-conspiracy.mp3',import.meta.url).href;
export const ARENA_TRACK=new URL('./assets/audio/lucien-last-reward.mp3',import.meta.url).href;
export const ARENA_THEME='l2-arena',ARENA_FADE_SECONDS=6,ARENA_MUSIC_LEVEL=.85;
export function musicThemeForNode(route,node){
  return route==='l'&&node?.id?.startsWith('l2_')&&node.location==='帝都コロシアム・砂地'?ARENA_THEME:route;
}
export class Soundscape {
  constructor(){this.ctx=null;this.timer=null;this.chord=0;this.active=[];this.theme='title';this.music=false;this.effects=false;this.volume=.28;this.reneAudio=null;this.reneSource=null;this.arenaAudio=null;this.arenaSource=null;this.arenaGain=null;this.arenaPlayback=0;this.pageSuspended=false;}
  get needsActivation(){return this.pageSuspended||this.ctx?.state!=='running'||(this.music&&((this.theme==='r'&&this.reneAudio?.paused!==false)||(this.theme===ARENA_THEME&&this.arenaAudio?.paused!==false)));}
  async unlock(){
    this.pageSuspended=false;
    if(!this.ctx){const A=window.AudioContext||window.webkitAudioContext;if(!A)return;this.ctx=new A();this.master=this.ctx.createGain();this.master.gain.value=this.volume;this.master.connect(this.ctx.destination);}
    if(this.ctx.state==='suspended')await this.ctx.resume().catch(()=>{});
    if(this.music&&this.ctx.state==='running')this.begin();
  }
  configure(settings){
    this.music=settings.music;this.effects=settings.effects;this.volume=settings.volume/100;
    if(this.master)this.master.gain.setTargetAtTime(this.volume,this.ctx.currentTime,.3);
    if(this.music&&this.ctx&&this.ctx.state==='running'){if(!this.timer)this.begin();}else this.stop();
  }
  begin(){
    if(!this.music||!this.ctx||this.ctx.state!=='running'||this.pageSuspended)return;
    if(this.theme===ARENA_THEME){this.stopSynth(2);this.pauseRene(true);this.playArena();return;}
    this.pauseArena(true);
    if(this.theme==='r'){this.stopSynth();this.playRene();return;}
    this.pauseRene(true);
    if(this.timer)return;this.pad();this.timer=setInterval(()=>this.pad(),6500);
  }
  setTheme(theme){if(this.theme===theme)return;this.stop(true,theme===ARENA_THEME?2:1);this.theme=theme;this.begin();}
  wantsArena(){return this.music&&this.theme===ARENA_THEME&&this.ctx?.state==='running'&&!this.pageSuspended;}
  playArena(){
    if(!this.wantsArena())return;
    if(!this.arenaAudio){
      const audio=new Audio(ARENA_TRACK);audio.loop=true;audio.preload='auto';
      const gain=this.ctx.createGain();gain.gain.value=0;
      const source=this.ctx.createMediaElementSource(audio);source.connect(gain);gain.connect(this.master);
      this.arenaAudio=audio;this.arenaSource=source;this.arenaGain=gain;
    }
    if(!this.arenaAudio.paused)return;
    const audio=this.arenaAudio,gain=this.arenaGain.gain,playback=++this.arenaPlayback;
    gain.cancelScheduledValues(this.ctx.currentTime);gain.setValueAtTime(0,this.ctx.currentTime);
    try{Promise.resolve(audio.play()).then(()=>{
      if(playback!==this.arenaPlayback)return;
      if(!this.wantsArena()){this.pauseArena();return;}
      const now=this.ctx.currentTime;
      gain.cancelScheduledValues(now);gain.setValueAtTime(0,now);
      gain.linearRampToValueAtTime(ARENA_MUSIC_LEVEL,now+ARENA_FADE_SECONDS);
    }).catch(()=>{});}catch{}
  }
  pauseArena(reset=false){
    this.arenaPlayback++;
    const audio=this.arenaAudio;if(!audio)return;
    audio.pause();this.arenaGain.gain.cancelScheduledValues(this.ctx.currentTime);this.arenaGain.gain.setValueAtTime(0,this.ctx.currentTime);
    if(reset&&audio.currentTime!==0){try{audio.currentTime=0;}catch{}}
  }
  wantsRene(){return this.music&&this.theme==='r'&&this.ctx?.state==='running'&&!this.pageSuspended;}
  playRene(){
    if(!this.wantsRene())return;
    if(!this.reneAudio){
      const audio=new Audio(RENE_TRACK);audio.loop=true;audio.preload='auto';
      const source=this.ctx.createMediaElementSource(audio);source.connect(this.master);
      this.reneAudio=audio;this.reneSource=source;
    }
    if(!this.reneAudio.paused)return;
    const audio=this.reneAudio;
    try{Promise.resolve(audio.play()).then(()=>{if(!this.wantsRene())audio.pause();}).catch(()=>{});}catch{}
  }
  pauseRene(reset=false){
    const audio=this.reneAudio;if(!audio)return;
    audio.pause();if(reset&&audio.currentTime!==0){try{audio.currentTime=0;}catch{}}
  }
  pad(){
    if(!this.music||!this.ctx||this.ctx.state!=='running'||this.theme==='r'||this.theme===ARENA_THEME||this.pageSuspended)return;
    const seq=this.theme==='l'?[[110,130.81,164.81],[98,123.47,146.83],[110,138.59,164.81]]:this.theme==='m'?[[73.42,110,146.83],[65.41,98,130.81],[69.3,103.83,138.59]]:[[110,164.81,220],[98,146.83,196],[87.31,130.81,174.61]];
    const notes=seq[this.chord++%seq.length];
    notes.forEach((hz,i)=>this.tone(hz,'sine',.055,8,i*.17,true));
    this.tone(notes[1]*2,'sine',.016,5,1.5,true);
  }
  tone(hz,type,volume,duration,delay=0,isMusic=false){
    if(!this.ctx)return;const t=this.ctx.currentTime+delay;
    const osc=this.ctx.createOscillator(),g=this.ctx.createGain();osc.type=type;osc.frequency.value=hz;
    const peak=Math.max(.0001,volume*(isMusic?3:1));
    g.gain.setValueAtTime(.0001,t);
    if(isMusic){
      g.gain.linearRampToValueAtTime(peak,t+.65);
      g.gain.setValueAtTime(peak,t+duration*.7);
    }else g.gain.exponentialRampToValueAtTime(peak,t+(duration>1?1.4:.01));
    g.gain.exponentialRampToValueAtTime(.0001,t+duration);
    osc.connect(g);g.connect(this.master);osc.start(t);osc.stop(t+duration+.05);
    const item={osc,g,isMusic};this.active.push(item);osc.onended=()=>{osc.disconnect();g.disconnect();this.active=this.active.filter(x=>x!==item);};
  }
  click(){if(this.effects)this.tone(620,'sine',.065,.06);}
  cue(name){
    if(!this.effects||this.pageSuspended)return;
    switch(name){
      case 'knock':this.tone(180,'triangle',.055,.12);this.tone(165,'triangle',.045,.12,.32);break;
      case 'alarm':this.tone(220,'sine',.07,.7);this.tone(196,'sine',.07,.7,.8);break;
      case 'impact':this.tone(55,'triangle',.12,.28);break;
      case 'light':this.tone(880,'sine',.025,2);this.tone(1320,'sine',.014,2.6);break;
      case 'archive-seal':this.tone(146.83,'triangle',.04,.2);this.tone(73.42,'sine',.05,.32,.04);break;
      case 'astrolabe':this.tone(493.88,'sine',.028,.44);this.tone(739.99,'sine',.022,.58,.19);break;
      case 'projector-chime':
        [392,493.88,587.33,783.99].forEach((frequency,i)=>this.tone(frequency,'sine',.031,.9,i*.16));
        break;
    }
  }
  stopSynth(fade=1){clearInterval(this.timer);this.timer=null;for(const item of this.active.filter(x=>x.isMusic&&!x.stopping)){item.stopping=true;try{item.g.gain.cancelScheduledValues(this.ctx.currentTime);item.g.gain.setTargetAtTime(.0001,this.ctx.currentTime,fade/4);item.osc.stop(this.ctx.currentTime+fade);}catch{}}}
  stop(reset=false,fade=1){this.stopSynth(fade);this.pauseRene(reset);this.pauseArena(reset);}
  suspend(){this.pageSuspended=true;this.stop();this.ctx?.suspend().catch(()=>{});}
}

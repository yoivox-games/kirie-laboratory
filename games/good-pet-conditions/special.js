import {endingStill,playUnlockSequence} from './unlock-sequence.js?v=3.3.0';

// Supplied films, available only after every ending, including Rene's two.
export const SPECIAL_MOVIES=Object.freeze([
  {id:'culture',title:'模倣された人間文化',description:'人類を下位種とみなす高位種が、人間文化を模倣して作った作品。',duration:'00:57'},
  {id:'culture-2',title:'模倣された人間文化2',description:'人間文化を模倣して作られた、もうひとつの作品。',duration:'00:40'},
  {id:'conquest',title:'全宇宙の支配者',description:'無数の銀河を征服し、全宇宙を支配下に置いた高位種。',duration:'01:27'},
  {id:'daily-life',title:'高位種の日常',description:'人間文化を観察し模倣し、時には娯楽として扱う彼らの日常。',duration:'00:36'},
  {id:'character-concepts',title:'ゲームキャラクター案',description:'ゲームキャラクターの原案をまとめた映像。',duration:'00:35'},
  {id:'interspecies',title:'異種交流',description:'異なる種族たちが出会い、交流するひととき。',duration:'00:32'},
].map(movie=>Object.freeze({...movie,src:`assets/special/${movie.id}.mp4`,poster:`assets/special/${movie.id}.webp`})));

const specialBeats=[
  {id:'chart',duration:3050,caption:'十一の結末が、記録された。'},
  {id:'aligned',duration:1650,caption:'星図に、最後の軌道が刻まれる。',cue:'astrolabe'},
  {id:'aperture',duration:1900,caption:'帝国の映像庫が、封を解く。'},
  {id:'projection',duration:1750,caption:'六巻のフィルムに、灯がともる。',cue:'projector-chime'}
];
export function playSpecialUnlock(options){
  return playUnlockSequence({...options,beats:specialBeats,readyClass:'special-ready'});
}
function starField(){
  const stars=Array.from({length:68},(_,i)=>{
    const x=(i*137.508+18)%360, y=(i*93.117+i*i*1.05+24)%640;
    return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${i%6===0?1.15:.62}" opacity="${(.3+(i%6)*.105).toFixed(2)}"/>`;
  });
  return `<svg class="vault-stars" aria-hidden="true" focusable="false" viewBox="0 0 360 640" preserveAspectRatio="xMidYMid slice" fill="#ffe9b9">${stars.join('')}<g fill="none" stroke="#ffe9b9" stroke-width=".7"><path d="M48 83v12m-6-6h12m232 65v9m-5-5h10M40 406v8m-4-4h8M309 43v7m-4-3.5h8"/></g></svg>`;
}
function astrolabe(records){
  const points=records.map((_,index)=>{
    const angle=index*2*Math.PI/records.length-Math.PI/2;
    return {x:180+138*Math.cos(angle),y:180+138*Math.sin(angle)};
  });
  const path=points.map((_,i)=>{
    const {x,y}=points[(i*2)%points.length];
    return `${i?'L':'M'}${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(' ')+'Z';
  const jewels=points.map(({x,y},i)=>`<span class="orb-cameo" style="left:${(x/3.6).toFixed(3)}%;top:${(y/3.6).toFixed(3)}%;--plate:${i}"><span class="orb-mount"><span class="orb-image">${endingStill(i)}</span></span><small>${records[i].number}</small></span>`).join('');
  const blades=Array.from({length:8},(_,i)=>`<g transform="rotate(${i*45})"><path class="iris-blade" d="M-47 -80Q15 -97 76 -57L82 -26 5 5 -26 20Z"/></g>`).join('');
  return `<div class="vault-instrument" aria-hidden="true"><div class="orrery">
    <svg class="orrery-engraving" viewBox="0 0 360 360" fill="none" focusable="false">
      <defs>
        <linearGradient id="orrery-gold" x2="1" y2="1" gradientUnits="objectBoundingBox"><stop stop-color="#806040"/><stop offset=".3" stop-color="#f8d99e"/><stop offset=".53" stop-color="#987144"/><stop offset=".8" stop-color="#e5cda6"/><stop offset="1" stop-color="#93764e"/></linearGradient>
        <linearGradient id="iris-metal" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#41363e"/><stop offset=".56" stop-color="#211e2a"/><stop offset="1" stop-color="#56473c"/></linearGradient>
        <clipPath id="iris-lens"><circle r="65"/></clipPath>
      </defs>
      <g stroke="url(#orrery-gold)"><circle cx="180" cy="180" r="164" opacity=".55"/><circle cx="180" cy="180" r="158" stroke-width="4" stroke-dasharray=".8 5.4"/><circle cx="180" cy="180" r="149"/><circle cx="180" cy="180" r="124" opacity=".5"/>
        <g class="orrery-meridians"><ellipse cx="180" cy="180" rx="100" ry="49" transform="rotate(-35 180 180)"/><ellipse cx="180" cy="180" rx="107" ry="46" transform="rotate(49 180 180)"/><circle cx="180" cy="180" r="108" stroke-dasharray="2 8"/></g>
      </g>
      <path class="constellation-trace" d="${path}" pathLength="1" stroke="#f3cf8e" stroke-width="1.25"/>
      <g transform="translate(180 180)"><circle r="73" fill="#201d2b" stroke="url(#orrery-gold)" stroke-width="2.5"/><circle r="69" stroke="#b99968" stroke-width="2" stroke-dasharray=".6 3"/>
        <g clip-path="url(#iris-lens)"><image href="assets/reveals/cosmic-vault.webp" x="-81" y="-101" width="162" height="238" preserveAspectRatio="xMidYMid slice"/>${blades}</g>
        <circle r="65.5" stroke="#e1c08b" stroke-width="1.2"/>
      </g>
    </svg>
    ${jewels}<div class="orrery-index"><small>ARCHIVUM</small><strong>XI</strong><span>帝　国　星　図</span></div>
  </div></div>`;
}
export function specialTableau(records){
  const frames=SPECIAL_MOVIES.map((movie,i)=>`<span class="film-exposure" style="--plate:${i}"><img src="${movie.poster}" alt=""><i>0${i+1}</i></span>`).join('');
  return `<div class="vault-sky" aria-hidden="true"><img data-unlock-art src="assets/reveals/cosmic-vault.webp" alt=""></div>
    <div class="vault-wash" aria-hidden="true"></div>${starField()}${astrolabe(records)}
    <div class="vault-folio" aria-hidden="true"><i></i><span>ASTRAL INDEX</span><i></i></div>
    <div class="vault-result unlock-result" data-unlock-result aria-hidden="true">
      <div class="vault-laurel"><span></span><i>✦</i><span></span></div><p class="vault-letterpress">THE IMPERIAL FILM ARCHIVE</p>
      <h1>SPECIAL</h1><p class="vault-line">帝国の、その向こうへ。</p>
      <div class="projector-film" style="--film-count:${SPECIAL_MOVIES.length}" aria-hidden="true">${frames}</div>
      <p class="vault-dedication">すべての結末を見届けたあなたへ。<br>六つの特別映像をお届けします。</p>
    </div>`;
}

function playMovie(video){
  try{Promise.resolve(video.play()).catch(()=>{});}catch{}
}

// Keep playback controls inside the game, including when the dialog is fullscreen.
export function bindSpecialMovieControls(dialog){
  const find=selector=>dialog.querySelector(selector);
  const video=find('video'),stage=find('.movie-stage'),error=find('.movie-error');
  const play=find('[data-movie-play]'),mute=find('[data-movie-mute]'),seek=find('[data-movie-seek]');
  const time=find('[data-movie-time]'),fullscreen=find('[data-movie-fullscreen]');
  const label=(button,text)=>{button.setAttribute('aria-label',text);button.title=text;};
  const clock=seconds=>{
    const whole=Number.isFinite(seconds)?Math.floor(seconds):0;
    return `${Math.floor(whole/60)}:${String(whole%60).padStart(2,'0')}`;
  };
  const syncPlay=()=>{
    const playing=!video.paused&&!video.ended;
    play.dataset.active=String(playing);label(play,playing?'一時停止':'再生');
  };
  const syncMute=()=>{
    mute.dataset.active=String(video.muted);label(mute,video.muted?'音を出す':'消音');
  };
  const syncTime=()=>{
    const duration=Number.isFinite(video.duration)?video.duration:0;
    seek.disabled=duration<=0;seek.max=String(duration);seek.value=String(video.currentTime);
    const position=clock(video.currentTime),total=clock(duration);
    time.textContent=`${position} / ${total}`;
    seek.setAttribute('aria-valuetext',`${position} / ${total}`);
  };
  const retry=()=>{error.hidden=true;video.load();playMovie(video);};
  const togglePlay=()=>{
    if(!error.hidden){retry();return;}
    if(video.paused||video.ended)playMovie(video);else video.pause();
  };
  for(const name of ['play','pause','ended'])video.addEventListener(name,syncPlay);
  for(const name of ['loadedmetadata','durationchange','timeupdate','emptied'])video.addEventListener(name,syncTime);
  video.addEventListener('volumechange',syncMute);
  play.addEventListener('click',togglePlay);
  mute.addEventListener('click',()=>{video.muted=!video.muted;});
  seek.addEventListener('input',()=>{if(!seek.disabled)video.currentTime=Number(seek.value);});
  find('[data-movie-retry]').addEventListener('click',retry);
  stage.addEventListener('click',event=>{if(event.target===stage&&error.hidden)togglePlay();});
  for(const name of ['contextmenu','dragstart'])stage.addEventListener(name,event=>event.preventDefault());
  const canFullscreen=()=>document.fullscreenEnabled&&typeof dialog.requestFullscreen==='function';
  const syncFullscreen=()=>label(fullscreen,dialog.classList.contains('movie-expanded')?'拡大表示を終了':document.fullscreenElement===dialog?'全画面表示を終了':canFullscreen()?'全画面表示':'拡大表示');
  fullscreen.addEventListener('click',async()=>{
    if(dialog.classList.contains('movie-expanded'))dialog.classList.remove('movie-expanded');
    else if(document.fullscreenElement===dialog){
      try{await document.exitFullscreen();}catch{}
    }else{
      if(canFullscreen())try{await dialog.requestFullscreen();}catch{}
      if(document.fullscreenElement!==dialog&&dialog.isConnected)dialog.classList.add('movie-expanded');
    }
    syncFullscreen();
  });
  dialog.addEventListener('fullscreenchange',syncFullscreen);
  syncPlay();syncMute();syncTime();syncFullscreen();
}

// A single selected film loads on demand; closing releases both audio and bytes.
export function startSpecialMovie(video,{settings,onError=()=>{}}){
  let disposed=false;
  video.volume=Math.min(1,Math.max(0,settings.volume/100));
  video.muted=!settings.music;
  const failed=()=>{if(!disposed)onError();};
  video.addEventListener('error',failed);
  playMovie(video);
  return{
    pause(){if(!disposed)video.pause();},
    dispose(){
      if(disposed)return;disposed=true;video.pause();
      video.removeEventListener('error',failed);video.removeAttribute('src');video.load();
    }
  };
}

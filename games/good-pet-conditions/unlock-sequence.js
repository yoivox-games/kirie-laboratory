// The visible progress line is the clock for each chapter. Its finish event
// also works on displays whose refresh rate drops while large artwork loads.
export function playUnlockSequence({section, beats, readyClass, motion=true, initiallyPaused=false, onCue=()=>{}, onComplete=()=>{}}){
  const meter=section.querySelector('[data-unlock-meter]');
  const caption=section.querySelector('[data-unlock-caption]');
  const result=section.querySelector('[data-unlock-result]');
  const total=beats.reduce((sum,beat)=>sum+beat.duration,0);
  let index=0, elapsed=0, phase='loading', paused=initiallyPaused;
  let clock=null, warmup=null, cue=null, finishedWhilePaused=false;

  function stopClock(){
    if(!clock)return;
    clock.onfinish=null;
    clock.cancel();
    clock=null;
  }
  function finish(){
    if(phase==='ready'||phase==='cancelled')return;
    clearTimeout(warmup);stopClock();cue=null;
    phase='ready';section.dataset.phase=phase;section.dataset.beat='ready';
    delete section.dataset.paused;
    section.classList.add(readyClass);
    result?.removeAttribute('aria-hidden');
    onComplete();
  }
  function soundBeat(){
    if(paused||!cue)return;
    const name=cue;cue=null;onCue(name);
  }
  function advance(){
    if(phase!=='playing')return;
    stopClock();finishedWhilePaused=false;
    const beat=beats[index++];
    if(!beat){finish();return;}
    section.dataset.beat=beat.id;
    caption.textContent=beat.caption;
    const start=elapsed/total;
    elapsed+=beat.duration;
    clock=meter.animate([{transform:'scaleX('+start+')'},{transform:'scaleX('+elapsed/total+')'}],{
      duration:beat.duration,easing:'linear',fill:'both'
    });
    const thisClock=clock;
    thisClock.onfinish=()=>{
      if(clock!==thisClock||phase!=='playing')return;
      if(paused){finishedWhilePaused=true;return;}
      advance();
    };
    cue=beat.cue;
    if(paused)clock.pause();else soundBeat();
  }
  function begin(){
    if(phase!=='loading')return;
    clearTimeout(warmup);phase='playing';section.dataset.phase=phase;advance();
  }
  section.dataset.phase=phase;section.dataset.beat=beats[0].id;
  if(paused)section.dataset.paused='true';
  if(!motion||!meter?.animate)finish();
  else{
    const pendingArt=[...section.querySelectorAll('img[data-unlock-art]')].filter(img=>!img.complete&&typeof img.decode==='function');
    if(pendingArt.length){
      warmup=setTimeout(begin,1000);
      Promise.allSettled(pendingArt.map(img=>img.decode())).then(begin);
    }else begin();
  }
  return{
    get pending(){return phase==='loading'||phase==='playing';},finish,
    pause(){
      if(paused||phase==='ready'||phase==='cancelled')return;
      paused=true;section.dataset.paused='true';clock?.pause();
    },
    resume(){
      if(!paused||phase==='ready'||phase==='cancelled')return;
      paused=false;delete section.dataset.paused;
      if(finishedWhilePaused)advance();else{clock?.play();soundBeat();}
    },
    cancel(){
      clearTimeout(warmup);stopClock();cue=null;phase='cancelled';
      section.dataset.phase=phase;delete section.dataset.paused;
    }
  };
}

// The imperial archive can load its nine plates without fetching either Rene ending.
export function endingStill(index){
  const outside=index>=9;
  const position=outside?(index-9)*100:index*100/8;
  return '<span class="ending-still '+(outside?'outside-still':'imperial-still')+'" style="background-position-x:'+position+'%"></span>';
}

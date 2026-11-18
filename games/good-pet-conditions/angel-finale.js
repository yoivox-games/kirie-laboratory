// A slow push toward the angel's iris, followed by a sustained whiteout.
// Animate one open-eye illustration so the face and eyelids stay unchanged.
export function playAngelFinale({section, open, veil, motion=true, onComplete=()=>{}, loadTimeout=2500}){
  const duration=8000, animations=[];
  let cancelled=false, complete=false, paused=false, started=false, timer;
  section.classList.add('angel-finale');
  section.dataset.angelPhase='loading';
  function finish(){
    if(cancelled||complete)return;
    complete=true;clearTimeout(timer);
    for(const animation of animations)animation.cancel();
    section.classList.add('angel-complete');section.dataset.angelPhase='complete';
    onComplete();
  }
  function start(){
    if(cancelled||complete||started)return;
    started=true;clearTimeout(timer);
    if(!motion){finish();return;}
    section.dataset.angelPhase='playing';
    const options={duration,fill:'both',easing:'linear'};
    animations.push(open.animate([
      {transform:'scale(1)'},{transform:'scale(1.34)'}
    ],options));
    const fade=veil.animate([
      {opacity:0,offset:0},{opacity:0,offset:.82},{opacity:1,offset:1}
    ],options);
    animations.push(fade);fade.onfinish=finish;
    if(paused)for(const animation of animations)animation.pause();
  }
  // Slow or missing art must never trap the player. Navigation can always cancel.
  timer=setTimeout(start,loadTimeout);
  Promise.resolve().then(()=>open.decode()).then(start,start);
  return {
    get pending(){return !cancelled&&!complete;},
    finish,
    pause(){paused=true;for(const animation of animations)animation.pause();},
    resume(){paused=false;if(!cancelled&&!complete)for(const animation of animations)animation.play();},
    cancel(){
      cancelled=true;clearTimeout(timer);
      for(const animation of animations)animation.cancel();
      section.classList.remove('angel-finale','angel-complete');
      delete section.dataset.angelPhase;
    }
  };
}

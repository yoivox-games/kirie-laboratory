// Presentation only. Story progression and save data remain owned by the engine.
export function galleryItems(illustrations, unlocked, reneOpen){
  return illustrations.filter(item=>(item.route!=='r'||reneOpen)&&unlocked(item.id));
}
export function adjacentArtwork(items,index,direction){
  return items.length?(index+direction+items.length)%items.length:0;
}

export function createSceneDissolve({portrait,image,background,loadTimeout=1800}){
  let revision=0,ghost=null,animation=null,timer=null,waiting=false,paused=false;
  const clean=()=>{clearTimeout(timer);timer=null;animation?.cancel();animation=null;ghost?.remove();ghost=null;waiting=false;};
  const cancel=()=>{revision++;clean();};
  const decode=img=>typeof img.decode==='function'?img.decode():Promise.resolve();
  return {
    set({src,backgroundSrc='',alt='',className='portrait uncropped',motion=true}){
      const hadImage=!!image.getAttribute('src');
      const previous=motion&&hadImage?(waiting&&ghost?ghost:portrait).cloneNode(true):null;
      cancel();const token=revision;
      image.style.opacity='';portrait.querySelector('.art-fallback')?.remove();
      image.src=src;image.alt=alt;image.classList.remove('art-change');
      background.hidden=!backgroundSrc;background.style.opacity='';
      if(backgroundSrc)background.src=backgroundSrc;else background.removeAttribute('src');
      portrait.className=className;
      if(!previous)return;
      ghost=previous;ghost.classList.add('scene-outgoing');ghost.setAttribute('aria-hidden','true');
      ghost.removeAttribute('id');ghost.querySelectorAll('[id]').forEach(el=>el.removeAttribute('id'));
      ghost.style.opacity='1';portrait.after(ghost);waiting=true;
      const reveal=()=>{
        if(token!==revision||!waiting)return;
        clearTimeout(timer);timer=null;waiting=false;
        if(!ghost?.animate){clean();return;}
        animation=ghost.animate([{opacity:1},{opacity:0}],{duration:850,easing:'ease-in-out',fill:'forwards'});
        animation.onfinish=()=>{if(token===revision)clean();};
        if(paused)animation.pause();
      };
      timer=setTimeout(reveal,loadTimeout);
      Promise.allSettled([decode(image),...(backgroundSrc?[decode(background)]:[])]).then(reveal);
    },
    cancel,finish:cancel,
    pause(){paused=true;animation?.pause();},
    resume(){paused=false;animation?.play();}
  };
}

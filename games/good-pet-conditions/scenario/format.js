// Human-authored screenplay helpers. A block is a continuous exchange, not a generated summary.
export const scene=(chapter,location,art)=>({scene:true,chapter,location,art,mood:''});
export function p(art,source){
  const beats=[];let current=art,feature=false,mood='',cue='',location='';
  for(const raw of source.trim().split('\n')){
    const line=raw.trim();if(!line)continue;
    if(line.startsWith('@')){current=line.slice(1);feature=false;mood='';continue;}
    if(line.startsWith('★')){current=line.slice(1);feature=true;mood='';continue;}
    if(line.startsWith('!')){[mood,cue]=line.slice(1).split(':');continue;}
    if(line.startsWith('#')){location=line.slice(1);continue;}
    const split=line.indexOf('|');
    beats.push({speaker:split<0?'':line.slice(0,split),text:split<0?line:line.slice(split+1),art:current,cg:feature?current:undefined,mood,cue,...(location?{location}:{})});
    cue='';
  }return beats;
}
export const option=(label,target,reply,note='',weight=2)=>({label,target,reply,note:note||label,weight});
export const choice=(text,choices)=>({speaker:'',text,choices});

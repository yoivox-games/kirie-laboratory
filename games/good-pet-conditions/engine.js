import { NODES, ROUTES, ENDINGS, resolveEnding } from './story.js?v=3.2.9';
export const SCHEMA=6;
export const clone=x=>JSON.parse(JSON.stringify(x));
export function freshRun(route){
  if(!ROUTES[route])throw Error('Unknown route');
  return {schema:SCHEMA,route,node:ROUTES[route].start,scores:{},lastTarget:null,ending:null,log:[],checkpoints:[],done:false};
}
export function isSecretOpen(completed){return completed.some(x=>ENDINGS[x]?.route==='z')&&completed.some(x=>ENDINGS[x]?.route==='l');}
export function enter(run){
  const node=NODES[run.node];if(!node)throw Error('Missing node: '+run.node);
  if(run.log.at(-1)?.id!==node.id)run.log.push({id:node.id,speaker:node.speaker,text:node.text,chapter:node.chapter});
  return node;
}
function jump(run,to){
  if(to.startsWith('@ending:')){
    const ending=to.slice(8);
    if(ENDINGS[ending]?.route!==run.route)throw Error('Invalid ending transition');
    run.ending=ending;run.node=ENDINGS[ending].start;
  }else if(to==='@resolve'){
    run.ending=resolveEnding(run);run.node=ENDINGS[run.ending].start;
  }else if(to.startsWith('@complete:')){
    run.ending=to.slice(10);run.done=true;
  }else run.node=to;
  if(!run.done)enter(run);
  return run;
}
export function advance(run){
  if(run.done)return run;
  const node=NODES[run.node];if(node.choices?.length)return run;
  return jump(run,node.next);
}
export function choose(run,index){
  if(run.done)throw Error('Completed run');
  const node=NODES[run.node],c=node.choices?.[index];
  if(!c)throw Error('Invalid choice');
  run.checkpoints.push({node:run.node,scores:clone(run.scores),lastTarget:run.lastTarget,logLength:run.log.length,label:c.label,note:c.note});
  for(const [k,v]of Object.entries(c.effects))run.scores[k]=(run.scores[k]||0)+v;
  run.lastTarget=c.target;
  run.log.push({id:node.id+'_choice',speaker:'選んだ行動',text:c.label,chapter:node.chapter});
  return jump(run,c.next);
}
export function rewind(run){
  const cp=run.checkpoints.pop();if(!cp)return false;
  run.node=cp.node;run.scores=cp.scores;run.lastTarget=cp.lastTarget;
  run.log=run.log.slice(0,cp.logLength);run.ending=null;run.done=false;return true;
}
export function replayEnding(id){
  const e=ENDINGS[id];if(!e)throw Error('Unknown ending');
  const run=freshRun(e.route);run.node=e.start;run.ending=id;run.replay=true;return run;
}
export function validRun(run){
  if(!run||run.schema!==SCHEMA||!ROUTES[run.route]||!NODES[run.node])return false;
  if(!run.node.startsWith(run.route)||typeof run.scores!=='object'||!run.scores)return false;
  if(!Array.isArray(run.log)||!Array.isArray(run.checkpoints))return false;
  if(run.ending&&(!ENDINGS[run.ending]||ENDINGS[run.ending].route!==run.route))return false;
  return Object.values(run.scores).every(x=>Number.isFinite(x)&&x>=0&&x<=100);
}

import { SCHEMA, validRun, freshRun } from './engine.js?v=3.2.9';
import { NODES, ENDINGS, ROUTES, ILLUSTRATIONS } from './story.js?v=3.2.9';
import { COMPLETE_V3_NODES } from './scenario/complete-v3-map.js?v=3.2.9';
import { MILITARY_V4_NODES } from './scenario/military-v4-map.js?v=3.2.9';
export const KEY='good-pet-conditions-v1';
export const DEFAULT_SETTINGS={speed:24,font:16,music:false,effects:false,volume:30,motion:true};
export function emptyData(){return {schema:SCHEMA,settings:{...DEFAULT_SETTINGS},completed:[],seen:[],viewedArt:[],reneIntroSeen:false,specialIntroSeen:false,auto:null,slots:[null,null,null]};}
const validSlot=s=>s===null||(s&&Number.isFinite(s.time)&&validRun(s.run));
const validSettings=s=>!!s&&[0,12,24,40].includes(s.speed)&&[14,16,18].includes(s.font)&&typeof s.music==='boolean'&&typeof s.effects==='boolean'&&typeof s.motion==='boolean'&&Number.isFinite(s.volume)&&s.volume>=0&&s.volume<=100;
const completeNode=id=>Object.hasOwn(MILITARY_V4_NODES,id)?MILITARY_V4_NODES[id]:Object.hasOwn(COMPLETE_V3_NODES,id)?COMPLETE_V3_NODES[id]:id;
const completeLogId=id=>typeof id==='string'&&id.endsWith('_choice')?completeNode(id.slice(0,-7))+'_choice':completeNode(id);
function upgradeCompleteRun(run){
  if(!run)return run;
  const node=completeNode(run.node);
  const log=Array.isArray(run.log)?run.log.map(entry=>entry&&completeLogId(entry.id)!==entry.id?{...entry,id:completeLogId(entry.id)}:entry):run.log;
  const checkpoints=Array.isArray(run.checkpoints)?run.checkpoints.map(cp=>cp&&completeNode(cp.node)!==cp.node?{...cp,node:completeNode(cp.node)}:cp):run.checkpoints;
  if(node===run.node&&(!Array.isArray(log)||log.every((entry,i)=>entry===run.log[i]))&&(!Array.isArray(checkpoints)||checkpoints.every((cp,i)=>cp===run.checkpoints[i])))return run;
  return {...run,node,log,checkpoints};
}
function needsCompleteUpgrade(data){
  return Array.isArray(data?.seen)&&data.seen.some(id=>completeNode(id)!==id)||[data?.auto,...(Array.isArray(data?.slots)?data.slots:[])].some(slot=>slot?.run&&upgradeCompleteRun(slot.run)!==slot.run);
}
function needsMilitaryUpgrade(data){
  const mapped=id=>typeof id==='string'&&Object.hasOwn(MILITARY_V4_NODES,id.replace(/_choice$/,''));
  return Array.isArray(data?.seen)&&data.seen.some(mapped)||[data?.auto,...(Array.isArray(data?.slots)?data.slots:[])].some(slot=>{
    const run=slot?.run;
    return run&&(mapped(run.node)||run.log?.some(entry=>mapped(entry?.id))||run.checkpoints?.some(cp=>mapped(cp?.node)));
  });
}
function upgradeCompleteData(data){
  if(!needsCompleteUpgrade(data))return data;
  const slot=s=>s?.run?{...s,run:upgradeCompleteRun(s.run)}:s;
  return {...data,seen:Array.isArray(data.seen)?[...new Set(data.seen.map(completeNode))]:data.seen,auto:slot(data.auto),slots:Array.isArray(data.slots)?data.slots.map(slot):data.slots};
}
export function validateData(x){
  if(!x||x.schema!==SCHEMA||!Array.isArray(x.completed)||!Array.isArray(x.seen)||!Array.isArray(x.viewedArt))return false;
  if(x.reneIntroSeen!==undefined&&typeof x.reneIntroSeen!=='boolean')return false;
  if(x.specialIntroSeen!==undefined&&typeof x.specialIntroSeen!=='boolean')return false;
  if(!x.completed.every(k=>ENDINGS[k])||!x.seen.every(k=>NODES[k])||!x.viewedArt.every(k=>ILLUSTRATIONS.some(a=>a.id===k)))return false;
  return validSlot(x.auto)&&Array.isArray(x.slots)&&x.slots.length===3&&x.slots.every(validSlot)&&validSettings(x.settings);
}
export function migrateData(old){
  old=upgradeCompleteData(old);
  if(old?.schema===SCHEMA)return validateData(old)?{...old,reneIntroSeen:old.reneIntroSeen??false,specialIntroSeen:old.specialIntroSeen??false}:null;
  if([2,3,4,5].includes(old?.schema)){
    if(!validSettings(old.settings)||!Array.isArray(old.completed)||!old.completed.every(k=>ENDINGS[k])||!Array.isArray(old.seen)||!Array.isArray(old.viewedArt)||!old.viewedArt.every(k=>ILLUSTRATIONS.some(a=>a.id===k))||!Array.isArray(old.slots)||old.slots.length!==3)return null;
    const revisedNode=id=>typeof id==='string'&&(/^m(?:[123])?_v[23]_\d+(?:_r\d+_\d+)?$/.test(id)||(old.schema<=3&&/^z(?:[123])?_v2_\d+(?:_r\d+_\d+)?$/.test(id))||(old.schema===2&&/^l(?:[123])?_v2_\d+(?:_r\d+_\d+)?$/.test(id)));
    if(!old.seen.every(id=>NODES[id]||revisedNode(id)))return null;
    const chapterArt={'m-c4':'m-c5','m-c5':'m-c7','m-c7':'m-c12','m-c8':'m-c13','m-c9':'m-c14','m-c10':'m-c15'};
    const result={...old,schema:SCHEMA,settings:{...old.settings},completed:[...new Set(old.completed)],seen:old.seen.filter(id=>NODES[id]),viewedArt:[...new Set(old.viewedArt.map(id=>chapterArt[id]||id))]};
    const slot=s=>{
      if(s===null)return null;
      const r=s?.run;if(!Number.isFinite(s?.time)||r?.schema!==old.schema)throw Error('Invalid previous save');
      let run={...r,schema:SCHEMA};
      if(!validRun(run)){
        if(!['z','l','m'].includes(r.route)||!r.node?.startsWith(r.route)||!revisedNode(r.node)||!Array.isArray(r.log)||!Array.isArray(r.checkpoints)||!r.scores||!Object.values(r.scores).every(v=>Number.isFinite(v)&&v>=0&&v<=100))throw Error('Invalid previous run');
        run=freshRun(r.route);
        if(r.ending){
          if(ENDINGS[r.ending]?.route!==r.route)throw Error('Invalid previous ending');
          run.ending=r.ending;run.node=ENDINGS[r.ending].start;run.done=!!r.done;
          if(r.replay)run.replay=true;
        }
      }
      if(!validRun(run))throw Error('Invalid revised save');
      return {time:s.time,run};
    };
    try{result.auto=slot(old.auto);result.slots=old.slots.map(slot);return validateData(result)?result:null;}catch{return null;}
  }
  if(old?.schema!==1||!validSettings(old.settings)||!Array.isArray(old.completed)||!old.completed.every(k=>ENDINGS[k])||!Array.isArray(old.slots)||old.slots.length!==3)return null;
  const result=emptyData();result.settings={...old.settings};result.completed=[...new Set(old.completed)];
  function slot(s){
    if(s===null)return null;
    const r=s?.run;
    if(!Number.isFinite(s?.time)||!r||r.schema!==1||!ROUTES[r.route]||!Array.isArray(r.log)||!Array.isArray(r.checkpoints)||!r.scores||!Object.values(r.scores).every(v=>Number.isFinite(v)&&v>=0&&v<=100))throw Error('Invalid legacy save');
    const fresh=freshRun(r.route);
    if(r.ending){
      if(ENDINGS[r.ending]?.route!==r.route)throw Error('Invalid legacy ending');
      fresh.node=ENDINGS[r.ending].start;fresh.ending=r.ending;fresh.done=!!r.done;
    }else if(r.route!=='m'){
      const chapter=[...r.log].reverse().find(x=>typeof x.chapter==='string')?.chapter||'第一章';
      const ordinal=['第一章','第二章','第三章','第四章','第五章'].findIndex(x=>chapter.startsWith(x));
      fresh.node=ROUTES[r.route].chapterStarts[Math.max(0,ordinal)].id;
      // Restart this chapter before its choice; retain decisions from earlier chapters.
      const cp=r.checkpoints.find(c=>r.log.find(x=>x.id===c.node)?.chapter===chapter);
      fresh.scores={...(cp?.scores||r.scores)};fresh.lastTarget=cp?cp.lastTarget:r.lastTarget;
    }
    if(!validRun(fresh))throw Error('Invalid migration');
    return {time:s.time,run:fresh};
  }
  try{result.auto=slot(old.auto);result.slots=old.slots.map(slot);return validateData(result)?result:null;}catch{return null;}
}
export function readData(){
  try{
    const raw=localStorage.getItem(KEY);if(!raw)return {data:emptyData(),error:false};
    const parsed=JSON.parse(raw),data=migrateData(parsed);
    if(!data)return {data:emptyData(),error:true};
    const completeRevision=needsCompleteUpgrade(parsed),militaryRevision=needsMilitaryUpgrade(parsed),migrated=parsed.schema!==SCHEMA||completeRevision;
    if(migrated){try{localStorage.setItem(KEY+(militaryRevision&&parsed.schema===SCHEMA?'-before-military-v5':completeRevision&&parsed.schema===SCHEMA?'-before-complete-v4':parsed.schema===2?'-before-lucien-v3':parsed.schema===3?'-before-zevran-v3':parsed.schema===4?'-before-military-v3':parsed.schema===5?'-before-military-v4':'-before-story-revision'),raw);}catch{}}
    const restartedLucien=parsed.schema===2&&[parsed.auto,...parsed.slots].some(s=>s?.run?.route==='l'&&!s.run.ending&&/^l_v2_/.test(s.run.node));
    const restartedZevran=[2,3].includes(parsed.schema)&&[parsed.auto,...parsed.slots].some(s=>s?.run?.route==='z'&&!s.run.ending&&/^z_v2_/.test(s.run.node));
    const restartedMilitary=[1,2,3,4,5].includes(parsed.schema)&&[parsed.auto,...parsed.slots].some(s=>s?.run?.route==='m'&&!s.run.ending&&(parsed.schema===1||/^m_v[23]_/.test(s.run.node)));
    return {data,error:false,migrated,restartedLucien,restartedZevran,restartedMilitary};
  }catch{return {data:emptyData(),error:true};}
}
export function writeData(data){try{localStorage.setItem(KEY,JSON.stringify(data));return true;}catch{return false;}}

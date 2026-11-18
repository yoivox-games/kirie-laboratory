// The original nine endings are a fixed requirement, never the new hidden endings.
export const BASE_ENDING_IDS=Object.freeze(['z1','z2','z3','l1','l2','l3','m1','m2','m3']);
export const RENE_ENDING_IDS=Object.freeze(['r1','r2']);
export const ALL_ENDING_IDS=Object.freeze([...BASE_ENDING_IDS,...RENE_ENDING_IDS]);
export function isSpecialOpen(completed=[]){
  const records=new Set(completed);
  return ALL_ENDING_IDS.every(id=>records.has(id));
}
export const needsSpecialIntro=data=>isSpecialOpen(data.completed)&&!data.specialIntroSeen;
export function isReneOpen(completed=[]){
  const records=new Set(completed);
  return BASE_ENDING_IDS.every(id=>records.has(id));
}
export const needsReneIntro=data=>isReneOpen(data.completed)&&!data.reneIntroSeen;
export const visibleEndingIds=completed=>isReneOpen(completed)?[...BASE_ENDING_IDS,...RENE_ENDING_IDS]:[...BASE_ENDING_IDS];

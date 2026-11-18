export const GAME_TITLE = '飼育区分：ニンゲン';
export const ROUTE_ORDER = ['z','l','m'];
export const TITLE_SCENES = [
  {id:'title-lab',label:'実験場',caption:'記録されるのは、命ではなく反応。'},
  {id:'title-arena',label:'コロシアム',caption:'歓声の届かない入口がある。'},
  {id:'title-breeding',label:'繁殖場',caption:'生まれる前から、行き先がある。'},
  {id:'title-abattoir',label:'屠畜場',caption:'ここでは、すべてが区分どおり。'},
  {id:'title-shop',label:'ニンゲンペットショップ',caption:'硝子の向こうに、値段がつく。'},
];
export const SELECTION = {
  z:{art:'select-z',expression:'select-z-down',alt:'アジサイの額縁に収まる、花を手に微笑むゼヴランの油彩肖像画',line:'「選んだつもりですか。……こちらへ。」',flowers:[['ゼヴラン','青いアジサイ','冷淡・無情','整えられた美しさと、意思を認めない所有。']]},
  l:{art:'select-l',expression:'select-l-down',alt:'黄色いカーネーションの額縁に収まる、気だるく頬杖をつくリュシアンの油彩肖像画',line:'「へえ。……じゃあ、退屈させるなよ。」',flowers:[['リュシアン','黄色いカーネーション','軽蔑','褒美を与える指と、興味を失う目。']]},
  m:{art:'select-m',expression:'select-m-down',alt:'花をあしらった額縁に収まる、中央のコンラートと後ろのエリアス、ロルフの油彩肖像画',line:'「では、管理権限を登録します。」',flowers:[['コンラート','ロベリア','悪意','礼儀正しい規則の中へ、罠を仕込む。'],['エリアス','クロユリ','呪い','穏やかな観察と、手放さない収集。'],['ロルフ','トリカブト','人間嫌い','丁寧な世話の行き先は、魔獣の食事。']]},
};
export const presentationArt = Object.fromEntries([
  ...TITLE_SCENES.map(s=>s.id),...Object.values(SELECTION).flatMap(s=>[s.art,s.expression])
].map(id=>[id,`assets/${id.startsWith('select-')?'v7':'v3'}/${id}.webp`]));
export function wrapRoute(index){return ((Math.trunc(index)%ROUTE_ORDER.length)+ROUTE_ORDER.length)%ROUTE_ORDER.length;}
export function pickTitleScene(previous='',random=Math.random){
  const pool=TITLE_SCENES.filter(s=>s.id!==previous);
  return pool[Math.min(pool.length-1,Math.max(0,Math.floor(random()*pool.length)))];
}
export function swipeDirection(dx,dy){return Math.abs(dx)>=48&&Math.abs(dx)>Math.abs(dy)*1.4?(dx<0?1:-1):0;}

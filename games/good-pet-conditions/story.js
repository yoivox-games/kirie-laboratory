import {chapters as z, endings as ze, revision as zevranRevision} from './scenario/zevran.js?v=3.2.9';
import {chapters as l, endings as le, revision as lucienRevision} from './scenario/lucien.js?v=3.2.9';
import {chapters as m, endings as me, revision as militaryRevision} from './scenario/military.js?v=3.2.9';
import {chapters as r, endings as re, revision as reneRevision} from './scenario/rene.js?v=3.2.9';
// Local, editable scenario. No remote generation or API calls.
export const ART = {
  zevran: 'assets/zevran.png', lucien: 'assets/lucien.png',
  konrad: 'assets/konrad.png', elias: 'assets/elias.png', rolf: 'assets/rolf.png',
  ole: 'assets/ole.png', air: 'assets/air.jpg', bridge: 'assets/imperial-bridge.jpg',
  hall: 'assets/hall.svg', garden: 'assets/garden.svg', arena: 'assets/arena.svg',
  archive: 'assets/archive.svg', gate: 'assets/gate.svg', light: 'assets/light.svg',
};

export const ROUTES = {
  z: {name:'ゼヴラン', fullName:'ゼヴラン・ヴェイル', role:'収蔵家', art:'zevran',
    number:'01', title:'硝子の向こうの価値', color:'#a9c8d4',
    description:'美しく、静かに、決められた場所で。\n完璧な手入れは、どこまでを奪うのか。',
    setting:'高級ペットショップ → 私設ギャラリー', endingIds:['z1','z2','z3']},
  l: {name:'リュシアン', fullName:'リュシアン・レザルク', role:'監査官', art:'lucien',
    number:'02', title:'気まぐれな帰宅', color:'#c59aa7',
    description:'昨日の正解が、今日も正しいとは限らない。\n今夜、彼は何を欲しがっている？',
    setting:'繁殖場の出荷区画 → 監査官の私邸', endingIds:['l1','l2','l3']},
  m: {name:'共同飼育', fullName:'帝国軍・共同飼育区画', role:'シークレット', art:'konrad',
    number:'03', title:'三つの管理権限', color:'#a8b3a2',
    description:'遊戯。保存。給餌。\n三人の丁寧な世話は、同じ未来を見ていない。',
    setting:'登録のない通路 → 帝国軍事施設', endingIds:['m1','m2','m3']},
  r: {name:'レネ',fullName:'レネ・アシュベル',role:'裏シナリオ',art:'rene',
    number:'00',title:'記録の外の暮らし',color:'#bbc7bd',
    description:'選べる服。同じ高さの椅子。\nここには、外へ出る扉だけが見つからない。',
    setting:'隔離邸宅・居住施設',endingIds:['r1','r2']},
};

export const ENDINGS = {
  z1:{route:'z',number:'01',title:'常設展示',art:'zevran',subtitle:'ここが、あなたの定位置。',hint:'来客の夜は合図に従って静止し、鑑定の日は目を伏せる。'},
  z2:{route:'z',number:'02',title:'特異個体',art:'archive',subtitle:'価値は、別の目録へ。',hint:'来客の夜は合図に従って静止し、鑑定の日は結晶の光を見つめ続ける。'},
  z3:{route:'z',number:'03',title:'楽園の底',art:'garden',subtitle:'檻の外にも、順番がある。',hint:'来客の夜、客の声に応えて顔を向ける。'},
  l1:{route:'l',number:'04',title:'優良個体',art:'hall',subtitle:'よい記録には、買い手がつく。',hint:'雨の夜、呼ぶ声にすぐ足元へ寄る。'},
  l2:{route:'l',number:'05',title:'最後のごほうび',art:'arena',subtitle:'拍手の向こうで、目が合った。',hint:'雨の夜は静かに待ち、ごほうびの朝に喜んで見上げる。'},
  l3:{route:'l',number:'06',title:'サロンの人気者',art:'lucien',subtitle:'また会える。帰る場所は違う。',hint:'雨の夜は静かに待ち、ごほうびの朝に戸惑う。'},
  m1:{route:'m',number:'07',title:'共同備品',art:'konrad',subtitle:'利用期限、定めなし。',hint:'採取を静かに耐え、司令官の遊戯では部屋の隅から動かない。'},
  m2:{route:'m',number:'08',title:'補給区分変更',art:'gate',subtitle:'最後まで、丁寧な管理だった。',hint:'採取と司令官の遊戯で、片方だけ二つ目の行動を選ぶ。'},
  m3:{route:'m',number:'09',title:'神の使者',art:'light',subtitle:'その目が、何を見たのか。',hint:'採取で声を漏らし、司令官の遊戯では境界線の内側で口元を見る。'},
  r1:{route:'r',number:'10',title:'優しい檻の真実',art:'ending-r1',subtitle:'差し出された手の、温かさを知っている。',hint:'書斎で、首輪の設計データと自分の過去について尋ねる。'},
  r2:{route:'r',number:'11',title:'星降る箱庭',art:'ending-r2',subtitle:'知らないまま、明日もここで。',hint:'書斎で何も聞かず、そっと端末から目を伏せる。'},
};


const additions = [
  ...['z','l','m'].flatMap(r=>Array.from({length:5},(_,i)=>`${r}-c${i+1}`)),
  ...Object.keys(ENDINGS).map(id=>'ending-'+id),
  'z-cold','z-satisfied','l-bored','l-irritated','k-stern','k-amused','e-calm','e-delighted','r-calm','r-pleased',
  'bg-shop','bg-gallery','bg-house','bg-house-day','bg-ward','bg-kennels','bg-garden','bg-arena',
  'mob-merchant','mob-attendant','mob-researcher','mob-refugees'
];
for(const id of additions)ART[id]='assets/v2/'+id+'.webp';
const lucienArt=[
  'lv3-bg-shipping','lv3-bg-house-night','lv3-bg-house-day','lv3-bg-rain',
  'lv3-bg-carriage','lv3-bg-arena-passage','lv3-bg-arena','lv3-bg-salon',
  'lv3-mob-clerk','lv3-mob-colleague','lv3-mob-arena','lv3-mob-salon',
  'lv3-ex-tired','lv3-ex-irritated','lv3-ex-teasing',
  ...Array.from({length:5},(_,i)=>'l-c'+(i+1)),...['l1','l2','l3'].map(id=>'ending-'+id)
];
for(const id of lucienArt)ART[id]='assets/v8/'+id+'.webp';
const zevranArt=[
  ...['shop','hall','gallery','case','night','window','transfer','removed','alley','institute','garden'].map(x=>'zv3-bg-'+x),
  ...['neutral','approval','irritation'].map(x=>'zv3-ex-'+x),
  ...['clerk','guests','appraiser','researcher','protector'].map(x=>'zv3-mob-'+x),
  ...Array.from({length:5},(_,i)=>'z-c'+(i+1)),...['z1','z2','z3'].map(x=>'ending-'+x)
];
for(const id of zevranArt)ART[id]='assets/v9/'+id+'.webp';
const militaryArt=[
  ...['loading','ward','night','clinic','threshold','scale','kennels','alarm'].map(x=>'mv3-bg-'+x),
  'mv3-prop-vials','mv3-beast','mv3-angel',
  ...['k-stern','k-amused','k-alarmed','e-calm','e-rapt','e-alarmed','r-calm','r-assessing','r-alarmed'].map(x=>'mv3-'+x),
  ...Array.from({length:10},(_,i)=>'m-c'+(i+1)),...['m1','m2','m3'].map(x=>'ending-'+x)
];
for(const id of militaryArt)ART[id]='assets/v10/'+id+'.webp';
const militaryRevisedArt=[
  ...['zoo','breeding','corridor','storm','courtyard'].map(x=>'mv4-bg-'+x),
  'mv4-r-calm','mv4-e-calm','mv4-e-rapt',
  ...Array.from({length:15},(_,i)=>'m-c'+(i+1)),'ending-m2','ending-m3'
];
for(const id of militaryRevisedArt)ART[id]='assets/v11/'+id+'.webp';
// Replace both old box-holding expressions, including resumed nodes that retain these IDs.
for(const id of ['mv3-r-assessing','mv3-r-alarmed','mv4-r-zoo'])ART[id]='assets/v12/'+id+'.webp';
export const PORTRAIT_ART=new Set([
  'zv3-ex-neutral','zv3-ex-approval','zv3-ex-irritation',
  'lv3-ex-tired','lv3-ex-irritated','lv3-ex-teasing',
  'mv3-k-stern','mv3-k-amused','mv4-e-calm','mv4-e-rapt',
  'mv4-r-calm','mv3-r-assessing','mv3-r-alarmed'
]);
for(const id of [...PORTRAIT_ART,'m-c1','ending-m1',...['3','6','7','12','13','14','15'].map(n=>'m-c'+n)])ART[id]='assets/v13/'+id+'.webp';
for(const id of ['ending-m1','angel-eye-open'])ART[id]='assets/v14/'+id+'.webp';
ART['m-c1']='assets/v15/m-c1.webp';
// Varied Lucien compositions and expressions; stable IDs retain all saved art unlocks.
const lucienRevisedArt=[...['tired','irritated','teasing'].map(x=>'lv3-ex-'+x),...Array.from({length:5},(_,i)=>'l-c'+(i+1)),'ending-l2','ending-l3'];
for(const id of lucienRevisedArt)ART[id]='assets/v16/'+id+'.webp';
ART['z-c3']='assets/v17/z-c3.webp';
// Complete 2026-10-26 routes: integrated SF facilities and matching scene props.
for(const id of ['lv4-bg-transport','lv4-bg-sanitary','lv4-bg-beast','zv4-bg-sanitary','ending-z2','z-c5'])ART[id]='assets/v18/'+id+'.webp';
ART['lv3-bg-salon']='assets/v18/lv4-bg-salon.webp';
ART['zv3-bg-window']=ART['z-c4']='assets/v18/zv4-bg-window.webp';
ART['zv3-bg-institute']=ART['ending-z2'];
ART['zv3-ex-neutral']='assets/v19/zv3-ex-neutral.webp';
ART['zv4-bg-rest']='assets/v19/zv4-bg-rest.webp';
ART['lv3-bg-arena']=ART['lv4-bg-beast'];
// Complete shared route: integrated imperial machinery, electronic props and the added floor test.
for(const id of ['m-c1','m-c4','m-c6','m-c8','m-c9','m-c10','m-c11','m-c-test','mv5-bg-test','mv5-bg-penalty','mv5-bg-zoo','mv5-bg-corridor'])ART[id]='assets/v20/'+id+'.webp';
ART['mv4-bg-zoo']=ART['mv5-bg-zoo'];
ART['mv4-bg-corridor']=ART['mv5-bg-corridor'];
ART['mv4-bg-breeding']='assets/v3/title-breeding.webp';
// Anatomically continuous figures and the exhibition individual's direct gaze.
for(const id of ['m-c-test','m-c4','m-c6','m-exhibit-front','zv3-ex-approval','zv3-ex-irritation'])ART[id]='assets/v21/'+id+'.webp';
ART['mv5-bg-penalty']='assets/v22/mv5-bg-penalty.webp';
ART['z-c-sanitary']='assets/v23/z-c-sanitary.webp';
for(const id of ['m-catalog-overview','m-catalog-spider','m-catalog-winged'])ART[id]='assets/v24/'+id+'.webp';
for(const id of ['rene',...['bedroom','dining','workshop','garden','living','study','observatory'].map(x=>'rv1-bg-'+x),...Array.from({length:8},(_,i)=>'r-c'+(i+1)),'ending-r1','ending-r2'])ART[id]='assets/rene/'+id+'.webp';
const flashbackTitles={
  'r-flashback-scientist':'回想　研究主任レネ',
  'r-flashback-detention':'回想　研究所の収容区画',
  'r-flashback-laboratory':'回想　神経接続の実験施設',
  'r-flashback-infant':'回想　布に包まれた赤ん坊'
};
for(const id of ['z-c-case','l-c-window'])ART[id]='assets/v28/'+id+'.webp';
const illustrationTitles={'z-c-case':'収蔵品　空いたひとつ分','l-c-window':'窓辺　眠らない塔','m-exhibit-front':'展示個体　ここはあたたかいよ','z-c-sanitary':'衛生管理　データ同期','m-catalog-overview':'電子図録　混成生物の一覧','m-catalog-spider':'電子図録　蜘蛛型の個体','m-catalog-winged':'電子図録　有翅型の個体'};
for(const id of Object.keys(flashbackTitles))ART[id]='assets/rene/'+id+'.webp';
const environmentArt=art=>typeof art==='string'&&art.includes('-bg-');
for(const [id,e]of Object.entries(ENDINGS))e.art='ending-'+id;
export const NODES={};
export const ILLUSTRATIONS=[];
export const SCENARIOS={z,l,m,r,...ze,...le,...me,...re};
function install(key,beats,terminal){
  const revision=key.startsWith('r')?reneRevision:key.startsWith('l')?lucienRevision:key.startsWith('z')?zevranRevision:militaryRevision;
  let context={chapter:'',location:'',art:'bg-shop',mood:''};
  const list=[],chapterStarts=[];
  for(const beat of beats){
    if(beat.scene){context={...context,...beat,background:beat.art};continue;}
    if(environmentArt(beat.art))context.background=beat.art;
    list.push({...context,...beat});
  }
  list.forEach((b,i)=>{
    const id=key+'_'+revision+'_'+i,next=i+1<list.length?key+'_'+revision+'_'+(i+1):terminal;
    const node={...b,id,next,progress:(i+1)/list.length};delete node.scene;
    if(i===0||b.chapter!==list[i-1].chapter)chapterStarts.push({id,chapter:b.chapter});
    if(b.choices)node.choices=b.choices.map((c,j)=>{
      const reply=Array.isArray(c.reply)?c.reply:[c.reply];
      const first=id+'_r'+j+'_0';
      let replyBackground=b.background;
      reply.forEach((r,k)=>{
        if(environmentArt(r.art))replyBackground=r.art;
        const rid=id+'_r'+j+'_'+k;
        NODES[rid]={...b,...r,background:replyBackground,id:rid,cg:r.cg,choices:undefined,progress:node.progress,next:k+1<reply.length?id+'_r'+j+'_'+(k+1):(c.ending?'@ending:'+c.ending:next)};
      });
      return {label:c.label,next:first,target:c.target,effects:{[c.target]:c.weight},note:c.note};
    });
    NODES[id]=node;
    if(b.cg&&!ILLUSTRATIONS.some(x=>x.id===b.cg))ILLUSTRATIONS.push({id:b.cg,art:b.cg,title:flashbackTitles[b.cg]||illustrationTitles[b.cg]||b.chapter,route:key[0],ending:ENDINGS[key]?key:null,node:id,...(flashbackTitles[b.cg]?{flashback:true}:{})});
  });
  if(ROUTES[key])ROUTES[key].chapterStarts=chapterStarts;
  return key+'_'+revision+'_0';
}
for(const [id,beats]of Object.entries({z,l,m,r}))ROUTES[id].start=install(id,beats,'@resolve');
for(const [id,beats]of Object.entries({...ze,...le,...me,...re}))ENDINGS[id].start=install(id,beats,'@complete:'+id);
export function hasIllustration(data,id){
  const entry=ILLUSTRATIONS.find(x=>x.id===id);
  return !!entry&&(data.viewedArt.includes(id)||(entry.ending&&data.completed.includes(entry.ending)));
}
export function hasDossier(data,art){
  const profile=DOSSIER.find(person=>person.art===art);
  return !!profile&&data.completed.some(id=>ENDINGS[id]?.route===profile.route);
}
export function resolveEnding(run){
  const v=k=>run.scores[k]||0;
  if(run.route==='r')return v('ask_truth')?'r1':'r2';
  if(run.route==='z'){
    if(!v('obey'))return 'z3';
    return run.lastTarget==='resonate'?'z2':'z1';
  }
  if(run.route==='l'){
    if(!v('read_mood'))return 'l1';
    return run.lastTarget==='reward'?'l2':'l3';
  }
  // ED3 is an external catastrophe, not mercy or a reward for a choice.
  const endurance=v('endurance')>0,rebellion=v('rebellion')>0;
  if(endurance&&!rebellion)return 'm1';
  if(!endurance&&rebellion)return 'm3';
  return 'm2';
}

export const DOSSIER = [
 {name:'ゼヴラン・ヴェイル',route:'z',role:'収蔵家',art:'zevran',text:'外見32歳相当。氷青の瞳、長い黒髪、白い手袋。帝国貴族として希少鉱物と工芸品を収蔵する。整えられた位置と美しい状態を何より重視し、世話をすることと意思を尊重することを結びつけない。'},
 {name:'リュシアン・レザルク',route:'l',role:'監査官',art:'lucien',text:'外見29歳相当。暗いワインレッドの髪と青灰の瞳。帝国監査局の上級監査官。仕事の苛立ちを持ち帰り、気分で接し方を変える。飼育の責任には飽きても、たまに会って反応を楽しむことは手放さない。'},
 {name:'コンラート・グライフェン',route:'m',role:'司令官',art:'konrad',text:'外見37歳相当。短い銀灰髪と冷たい青の瞳。厳格な指揮官であり、規則と選択に仕掛けを作る遊戯家。明示した条件は守るが、与えた権限の範囲は狭い。'},
 {name:'エリアス・ヴェルナー',route:'m',role:'軍医',art:'elias',text:'外見33歳相当。亜麻色の髪、六角形の眼鏡、青磁の瞳。個体にひとつしかないものと、その時点にしか残せない生体試料を収集する。混成生物園の熱心な来園者。'},
 {name:'ロルフ・ヴァルガ',route:'m',role:'魔獣管理官',art:'rolf',text:'外見32歳相当。黒髪に銀白の一房、灰色を含む琥珀の瞳。ニンゲンの扱いは静かで丁寧だが、その目的は魔獣用の飼料品質を保つこと。深い愛情は魔獣に向けられている。'},
 {name:'レネ・アシュベル',route:'r',role:'隠居した技術者',art:'rene',hidden:true,text:'外見40歳前後。銀灰色の長い髪を半分まとめ、オリーブ色の瞳の内側に金の輪を持つ。深紺のコートに天体軌道の刺繍。天体器具の修理と室内庭園を好み、同じ高さの椅子で話を聞く。隔離邸宅の外のことは、静かに話題を変える。'},
];

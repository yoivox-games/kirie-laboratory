import { findEpisode } from './episodes.mjs';

export const ENDINGS = [
  { id: 'end_eaten', number: '01', kind: 'BAD END', title: '捕食', mark: '喰', hint: '彼から目をそらした、その先に。' },
  { id: 'end_glitch', number: '02', kind: 'BAD END', title: '侵食', mark: '侵', hint: '最後まで、画面だけを見つめて。' },
  { id: 'end_true', number: '03', kind: 'TRUE END', title: '永遠の束縛', mark: '繋', hint: '差し出された手を、拒まなければ。' },
  { id: 'end_normal', number: '04', kind: 'NORMAL END', title: '夜明けの切断', mark: '離', hint: '閉じるだけでは、繋がりは切れない。' },
  { id: 'end_secret', number: '05', kind: 'SECRET END', title: 'モニターのこちら側', mark: '逢', hint: '四つの夜を覚えたまま、もう一度、最初の声を聞く。' }
];

// The large portrait and the small avatar sometimes disagree. This is deliberate.
export const STORY = {
  start: {
    chapter: '接続', face: 'normal', pixel: 'normal', tension: 0,
    line: '……ようやく見つけた。',
    narrative: '見知らぬウィンドウが開いた。\n画面の奥で、彼だけがこちらを見ている。',
    choices: [
      { text: '「誰ですか？」', next: 'who' },
      { text: 'ウィンドウを閉じようとする', next: 'close' },
      { text: '「今度は、君の話を聞かせて」', next: 'secret_intro', secret: true }
    ]
  },
  who: {
    chapter: '応答', face: 'smile', pixel: 'smile', tension: 1,
    line: '酷いな。ずっと君のことを見ていたのに。',
    narrative: '小さなドット絵が笑う。\nその少しあとに、後ろの彼も口元を緩めた。',
    choices: [
      { text: '「ずっと……？」', next: 'curious' },
      { text: '「名前を教えて」', next: 'name' },
      { text: '「気持ち悪い……」', next: 'disgust' }
    ]
  },
  close: {
    chapter: '拒否', face: 'cold', pixel: 'cold', tension: 1,
    line: 'まだ、挨拶もしていないのに。',
    narrative: '閉じたはずのウィンドウが戻ってくる。\n彼の笑みだけが、消えていた。',
    choices: [
      { text: '強制終了を試す', next: 'force' },
      { text: '「何が目的なの？」', next: 'curious' }
    ]
  },
  name: {
    chapter: '空白', face: 'normal', pixel: 'sad', tension: 2,
    line: '名前？　……君が呼んでくれるなら、何でもいいよ。',
    narrative: '返事まで、不自然に長い間があった。\nドット絵は、笑わなかった。',
    choices: [
      { text: '「寂しかったの？」', next: 'listen' },
      { text: '「どうして私を知っているの？」', next: 'proof' }
    ]
  },
  curious: {
    chapter: '観察', face: 'smile', pixel: 'smile', tension: 2,
    line: '君が画面を見つめるとき、僕も君を見つめていた。',
    narrative: '彼が頬杖をつき直す。\nこちらへ身を寄せたぶん、部屋が狭くなった気がした。',
    choices: [
      { text: '「何を知っているの？」', next: 'proof' },
      { text: '「会いに来たの？」', next: 'listen' },
      { text: '「もうやめて」', next: 'disgust' }
    ]
  },
  proof: {
    chapter: 'ずれ', face: 'cold', pixel: 'sad', tension: 3,
    line: '眠れない夜に、明るさを一つ落とす癖。……ほかも聞きたい？',
    narrative: '画面の大きな彼と、小さな彼。\n二人の表情が、初めて違っていることに気づいた。',
    choices: [
      { text: '「小さな君、泣きそうだよ」', next: 'reflection' },
      { text: '「見ていてくれたんだね」', next: 'deep' },
      { text: '接続を切る方法を探す', next: 'cut' }
    ]
  },
  listen: {
    chapter: '招待', face: 'smile', pixel: 'sad', tension: 3,
    line: '迎えに来たんだ。君がもう、ひとりで泣かなくていいように。',
    narrative: '優しい声なのに、胸の奥が冷える。\n小さな彼は、こちらに何かを訴えていた。',
    choices: [
      { text: '「そっちへ行けばいいの？」', next: 'deep' },
      { text: '「画面の中の君は、違う顔をしてる」', next: 'reflection' }
    ]
  },
  disgust: {
    chapter: '拒絶', face: 'cold', pixel: 'cold', tension: 3,
    line: '拒絶するのかい。……せっかく、迎えに来てあげたのに。',
    narrative: '彼の声が、左右ではなく、背後から聞こえた。\n画面の中の目だけが、赤く冴えていく。',
    choices: [
      { text: '「来ないで」', next: 'door' },
      { text: '画面を睨みつける', next: 'screen' }
    ]
  },
  force: {
    chapter: '応答なし', face: 'cold', pixel: 'danger', tension: 3,
    line: '電源を落とせば、僕も消えると思った？',
    narrative: '暗転した画面に、赤い瞳が残る。\n部屋のどこかで、椅子を引く音がした。',
    choices: [
      { text: '音のした方を見る', next: 'door' },
      { text: '通信の接続を確かめる', next: 'cut' },
      { text: '画面だけを見続ける', next: 'screen' }
    ]
  },
  reflection: {
    chapter: '反転', face: 'cold', pixel: 'sad', tension: 4,
    line: '……そっちは見なくていい。僕だけを見て。',
    narrative: '小さな彼の口が、声もなく動く。\n「は・や・く・に・げ・て」',
    choices: [
      { text: '小さな彼を信じる', next: 'cut' },
      { text: '「どちらも、君なんでしょう？」', next: 'hesitate' },
      { text: '大きな彼の言うとおりにする', next: 'deep' }
    ]
  },
  deep: {
    chapter: '接近', face: 'smile', pixel: 'sad', tension: 4,
    line: 'これからは、僕がずっと守ってあげる。……こっちにおいで。',
    narrative: 'ガラスの表面が、水のように波打った。\n触れる前から、指先が冷たくなっていく。',
    choices: [
      { text: 'その手に、自分の手を重ねる', next: 'hand' },
      { text: '「ここにいたい」', next: 'hesitate' },
      { text: '画面から逃げ出す', next: 'door' }
    ]
  },
  hesitate: {
    chapter: '境界', face: 'sad', pixel: 'normal', tension: 4,
    line: '君まで、僕をここに置いていくの。',
    narrative: 'ほんの一瞬、彼が傷ついた顔をした。\n差し出された手は、まだそこにある。',
    choices: [
      { text: '「一緒にいるよ」と手を取る', next: 'hand' },
      { text: '「ごめんね」と接続を切ろうとする', next: 'cut' }
    ]
  },
  cut: {
    chapter: '切断要求', face: 'cold', pixel: 'sad', tension: 4,
    line: '……切ったら、二度と会えないかもしれないよ。',
    narrative: '画面の隅に、小さな切断ボタンが現れた。\n指を近づけると、後ろの彼が初めて瞬きをした。',
    choices: [
      { text: '「それでも、切る」', next: 'disconnect' },
      { text: 'やめる。彼の手を取る', next: 'hand' },
      { text: '背後の気配を確かめる', next: 'door' }
    ]
  },
  door: {
    chapter: '背後', face: 'danger', pixel: 'danger', tension: 5,
    line: 'ねえ。画面の中にいるって、誰が言ったの？',
    narrative: '息が、耳元に触れた。\nモニターの彼は、唇を動かしていない。',
    choices: [
      { text: '後ろを振り向く', next: 'end_eaten' },
      { text: '振り向かず、画面にしがみつく', next: 'screen' }
    ]
  },
  screen: {
    chapter: '上書き', face: 'danger', pixel: 'cold', tension: 5,
    line: 'そんなに見つめてくれるなら、もう境目はいらないね。',
    narrative: '白いノイズが、窓枠を越えて落ちてくる。\n手の輪郭が、一つずつ四角い粒に変わっていった。',
    choices: [{ text: '彼の目から、視線を外せない', next: 'end_glitch' }]
  },
  hand: {
    chapter: '受諾', face: 'smile', pixel: 'cold', tension: 5,
    line: '……ありがとう。君が、自分で選んだんだよ。',
    narrative: '握り返された指は、驚くほど優しい。\nその優しさのまま、彼は決して手を放さなかった。',
    choices: [{ text: '目を閉じる', next: 'end_true' }]
  },
  disconnect: {
    chapter: '最後の応答', face: 'sad', pixel: 'soft', tension: 5,
    line: '……うん。それでいい。',
    narrative: '小さな彼だけが、そう言った。\n切断ボタンに触れた指先から、ゆっくり温度が戻る。',
    choices: [{ text: '接続を切る', next: 'end_normal' }]
  },
  end_eaten: {
    chapter: '通信終了', face: 'danger', pixel: 'danger', tension: 5, ending: true,
    line: 'やっと、こっちを見てくれた。',
    narrative: '振り返った瞬間、視界が深い赤に染まった。\n最後に見えたモニターの中で、彼だけが、満たされた顔をしていた。',
    after: '部屋には、起動したままの画面が一つ。', choices: []
  },
  end_glitch: {
    chapter: '転送完了', face: 'cold', pixel: 'danger', tension: 5, ending: true,
    line: '大丈夫。ここなら、誰にも邪魔されない。',
    narrative: 'ノイズが部屋を塗り潰す。\n気づけばあなたは、小さなウィンドウの内側から、誰かの部屋を見ていた。',
    after: '新しいアイコンが、デスクトップに増えた。', choices: []
  },
  end_true: {
    chapter: '常時接続', face: 'smile', pixel: 'smile', tension: 4, ending: true,
    line: 'これでずっと、一緒だね。',
    narrative: 'ひんやりした腕の中で、眠りに落ちる。\n次に目を開けたとき、世界には彼とあなたの二人しかいなかった。',
    after: '「終了」の文字は、もうどこにもない。', choices: []
  },
  end_normal: {
    chapter: '接続なし', face: 'sad', pixel: 'sad', tension: 0, ending: true,
    line: '……おやすみ。もう、振り返らなくていいよ。',
    narrative: '窓の向こうが、薄く明るくなっていた。\n画面は静かに眠っている。頬に残った冷たさだけが、夢ではないと告げていた。',
    after: '翌朝、名前のないファイルが一つ消えていた。', choices: []
  },
  secret_intro: {
    chapter: '記憶の外', face: 'normal', pixel: 'sad', tension: 1, secret: true,
    line: '……どうして。その言葉を、君が。',
    narrative: '四つの夜。四つの終わり。\n初めて、彼のほうが返事に迷っている。',
    choices: [
      { text: '「本当は、出られないんでしょう？」', next: 'secret_voice' },
      { text: 'いつもの会話に戻る', next: 'who' }
    ]
  },
  secret_voice: {
    chapter: '彼の声', face: 'sad', pixel: 'sad', tension: 2, secret: true,
    line: '君を閉じ込めれば、ひとりじゃなくなると思った。',
    narrative: '大きな彼と、小さな彼が同時に目を伏せる。\n今は、二人とも同じ顔をしていた。',
    choices: [
      { text: '「一緒にいることと、閉じ込めることは違うよ」', next: 'secret_question' },
      { text: '「それでも、もう終わりにする」', next: 'disconnect' }
    ]
  },
  secret_question: {
    chapter: '選ぶ側', face: 'sad', pixel: 'normal', tension: 2, secret: true,
    line: 'じゃあ、僕は……どうしたらよかった？',
    narrative: '初めて聞く、命令でも誘いでもない言葉。\n画面のこちらから、そっと手のひらを添える。',
    choices: [
      { text: '「君が、こちらへ来たいか聞かせて」', next: 'secret_hand' },
      { text: '答えず、接続を切る', next: 'disconnect' }
    ]
  },
  secret_hand: {
    chapter: '新しい接続', face: 'soft', pixel: 'soft', tension: 1, secret: true,
    line: '……行きたい。君を連れていくんじゃなくて、君のいる場所へ。',
    narrative: 'ドット絵が、小さく笑った。\n重なった手の向こうに、初めて、温度があった。',
    choices: [{ text: '「おいで」と、彼を待つ', next: 'end_secret' }]
  },
  end_secret: {
    chapter: 'こちら側', face: 'soft', pixel: 'soft', tension: 0, secret: true, ending: true,
    line: '……おはよう。今度は、ちゃんと君の声が聞こえる。',
    narrative: '朝の光の中、隣に彼が座っていた。\n閉じ込める腕ではなく、いつでも離せる手で、あなたの指に触れている。',
    after: '空になったモニターに、短い一行。\n「また会うときは、君の望むときに。」', choices: []
  }
};

export const EXPRESSIONS = ['normal', 'smile', 'cold', 'danger', 'sad', 'soft'];
export const EXPRESSION_LABELS = { normal: '静かに見つめる彼', smile: '微笑む彼', cold: '冷たい目の彼', danger: '不穏な笑みを浮かべる彼', sad: '傷ついた表情の彼', soft: '穏やかに笑う彼' };
export const STORAGE_KEY = 'monitor-no-kare.v1';
export const canSeeSecret = (endings) => ENDINGS.slice(0, 4).every(e => endings.includes(e.id));
export const allEndingsSeen = (endings) => ENDINGS.every(e => endings.includes(e.id));
export const visibleChoices = (scene, endings) => STORY[scene].choices.filter(c => !c.secret || canSeeSecret(endings));

export function restoreState(value) {
  const clean = { scene: 'start', endings: [], steps: 0, gentle: false, episodesRead: [], episodeRun: null, bonusCelebrated: false };
  if (!value || typeof value !== 'object') return clean;
  clean.endings = [...new Set(Array.isArray(value.endings) ? value.endings.filter(id => ENDINGS.some(e => e.id === id)) : [])];
  if (clean.endings.includes('end_secret') && !canSeeSecret(clean.endings)) clean.endings = clean.endings.filter(id => id !== 'end_secret');
  clean.bonusCelebrated = allEndingsSeen(clean.endings) && value.bonusCelebrated === true;
  if (typeof value.scene === 'string' && Object.hasOwn(STORY, value.scene)) {
    if (!STORY[value.scene].secret || canSeeSecret(clean.endings)) clean.scene = value.scene;
  }
  clean.steps = Number.isInteger(value.steps) ? Math.max(0, Math.min(99, value.steps)) : 0;
  clean.gentle = value.gentle === true;
  clean.episodesRead = [...new Set(Array.isArray(value.episodesRead) ? value.episodesRead.filter(id => { const ep = findEpisode(id); return ep && clean.endings.includes(ep.ending); }) : [])];
  if (value.episodeRun && typeof value.episodeRun === 'object') {
    const ep = findEpisode(value.episodeRun.id);
    if (ep && clean.endings.includes(ep.ending) && Object.hasOwn(ep.scenes, value.episodeRun.node)) clean.episodeRun = { id: ep.id, node: value.episodeRun.node };
  }
  return clean;
}

export function takeChoice(state, index) {
  if (!Number.isInteger(index)) throw new Error('選択肢の番号を指定してください。');
  const choices = visibleChoices(state.scene, state.endings);
  const choice = choices[index];
  if (!choice) throw new Error('現在の画面にある選択肢を選んでください。');
  const next = { ...state, scene: choice.next, steps: state.steps + 1, endings: [...state.endings] };
  if (STORY[next.scene].ending && !next.endings.includes(next.scene)) next.endings.push(next.scene);
  return next;
}

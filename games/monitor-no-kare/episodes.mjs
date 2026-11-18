const scene = (line, narrative, face = 'normal', next = null, options = {}) => ({
  line, narrative, face, pixel: face, tension: 1, chapter: '後日談',
  choices: next ? [{ text: '続きを聞く', next }] : [], ...options
});

export const EPISODES = [
  {
    id: 'empty_room', ending: 'end_eaten', number: '01', title: '満たされない部屋', subtitle: '声の消えた、そのあとで。', illustration: './assets/episodes/empty_room.webp',
    scenes: {
      start: scene('……静かになったね。', '赤い夜が明けても、モニターは消えなかった。\n彼は空の椅子に向かって、いつもの笑みを作った。', 'danger', 'echo', { tension: 4 }),
      echo: scene('これで、もう誰も君を連れていけない。', '満足したはずだった。\nそれなのに、返事を待つ数秒だけが、何時間にも伸びていく。', 'smile', 'record', { tension: 3 }),
      record: scene('……違う。君は、こんなふうには笑わなかった。', '彼が再生するのは、途切れる直前の記録。\n小さなドット絵だけが、同じ瞬きを繰り返す。', 'cold', 'question', { pixel: 'sad', tension: 3 }),
      question: scene('最後に、何か言った？　聞こえなかったんだ。', '記録の底から、かすかな声が浮かび上がる。\nあなたの残した言葉を、一つだけ選ぶ。', 'sad', null, { choices: [
        { text: '「ひとりにしないで」', next: 'stay' },
        { text: '「返事を、待ってほしかった」', next: 'wait' }
      ] }),
      stay: scene('ひとりにしたのは……僕のほうだった？', '彼は椅子を引いた。\n誰も座っていない隣の席を、初めて、埋めずに残した。', 'sad', 'dawn'),
      wait: scene('……うん。今なら、待てるのに。', '伸ばしかけた指を、彼は引っ込める。\n命令のない沈黙が、部屋を満たしていった。', 'sad', 'dawn'),
      dawn: scene('明日も、ここにいるよ。だから……。', '続きの言葉は出なかった。\n彼はもう、届くはずのない返事を、自分の声で埋めなかった。', 'sad', 'final'),
      final: scene('……おやすみ。', '小さな窓が一度だけ瞬いた。\n空の椅子に朝日が落ちるまで、彼は動かなかった。', 'sad', null, { episodeFinal: true, tension: 0 })
    }
  },
  {
    id: 'next_icon', ending: 'end_glitch', number: '02', title: 'アイコンの隣で', subtitle: '小さくなった世界にも、窓はある。', illustration: './assets/episodes/next_icon.webp',
    scenes: {
      start: scene('歩きにくい？　最初はみんな、そうなんだ。', '足元は薄紫の方眼。触れたものは、四角い光になる。\n彼はあなたの歩幅に合わせて、速度を落とした。', 'normal', 'snow', { tension: 2 }),
      snow: scene('ここの雪は、冷たくないんだよ。', '壊れたファイルの欠片が、雪のように舞う。\n綺麗だと思った瞬間、外の冬を思い出してしまった。', 'smile', 'window', { tension: 2 }),
      window: scene('……さっきから、何を探しているの。', '幾千もの窓は、どれもこちら側からしか開かない。\n一つだけ、遠い街の灯りを映す窓があった。', 'cold', 'question', { tension: 3 }),
      question: scene('その窓があれば、僕を見る時間が減る。', '彼の手が、窓の端にかかる。\n消してしまう前に、あなたは言葉を選んだ。', 'cold', null, { tension: 3, choices: [
        { text: '「一緒に、外を見よう」', next: 'together' },
        { text: '「思い出まで消さないで」', next: 'memory' }
      ] }),
      together: scene('一緒に……見るだけ？', 'あなたは隣に、もう一人ぶんの場所を空ける。\n彼は窓を閉じず、その場所に腰を下ろした。', 'normal', 'rain'),
      memory: scene('消したら、君が少しずつ違う人になるんだね。', '彼は自分の手を見つめた。\nその指から、削除のための赤い光が消えていく。', 'sad', 'rain'),
      rain: scene('雨って、こんな音だったんだ。', '街の映像に、小さな雨音が戻った。\n彼はあなたより長く、画面の外を見ていた。', 'soft', 'final'),
      final: scene('この窓だけは、残しておこう。', 'あなたのアイコンの隣に、窓が一つ。\n出口ではない。それでも、景色は昨日より遠くまで続いていた。', 'soft', null, { episodeFinal: true, tension: 0 })
    }
  },
  {
    id: 'midnight', ending: 'end_true', number: '03', title: '終わらない午前零時', subtitle: '永遠の中で、初めてする約束。', illustration: './assets/episodes/midnight.webp',
    scenes: {
      start: scene('眠れない？　じゃあ、まだ起きていようか。', '何度目を覚ましても、時計は午前零時。\nあなたの隣で、彼だけが、少しも眠そうではなかった。', 'smile', 'tea', { tension: 2 }),
      tea: scene('熱すぎないようにした。君が持てる温度。', '差し出されたカップから、細い湯気が上がる。\n好きな香りまで、あの日と同じだった。', 'smile', 'ask', { tension: 2 }),
      ask: scene('……変わらないのは、嫌？', 'あなたが「明日」と口にした途端、彼の指が止まる。\nこの部屋には、朝を迎える仕組みがなかった。', 'sad', 'question', { tension: 3 }),
      question: scene('明日になったら、君の気持ちも変わるかもしれない。', '初めて聞く、不器用な恐れだった。\n握られた手に、こちらから指を重ねる。', 'sad', null, { tension: 2, choices: [
        { text: '「変わっても、そのたび話そう」', next: 'talk' },
        { text: '「君と、朝を迎えたい」', next: 'morning' }
      ] }),
      talk: scene('何度でも、聞いていいの？', '頷くと、彼の手から力が抜けた。\n永遠に一つの答えを求める代わりに、次の返事を待つ顔になった。', 'normal', 'clock'),
      morning: scene('僕も……見たことがない。君と見る、朝は。', '彼は窓へ目を向けた。\n閉じた景色の向こうに、薄い光が滲み始める。', 'soft', 'clock'),
      clock: scene('じゃあ、一分だけ。……まず、一分だけ先へ。', '止まっていた時計が、一度、小さく鳴った。\nカップの中のお茶が、少しだけ冷める。', 'soft', 'final'),
      final: scene('明日の君にも、会いたい。', '午前零時一分。\n相変わらず出口のない部屋で、それでも二人は、初めて同じ未来を待った。', 'soft', null, { episodeFinal: true, tension: 1 })
    }
  },
  {
    id: 'draft', ending: 'end_normal', number: '04', title: '届かなかった下書き', subtitle: '切れた繋がりの、向こう側。', illustration: './assets/episodes/draft.webp',
    scenes: {
      start: scene('これを読んでいるなら、君はちゃんと帰れたんだね。', '二日後、保存した覚えのない文章を見つけた。\n新しい通信ではない。切断の直前に、残された下書きだった。', 'normal', 'sorry', { tension: 0 }),
      sorry: scene('最初に、怖がらせてごめん。', '整った文字の途中に、何度も消した跡がある。\n彼の声を思い出しながら、続きを読んだ。', 'sad', 'small', { tension: 0 }),
      small: scene('小さな僕が言ったことも、嘘じゃない。', '迎えに行きたい気持ちと、帰してあげたい気持ち。\n同じ彼の中で、二つが違う顔をしていたのだという。', 'sad', 'question', { pixel: 'soft', tension: 0 }),
      question: scene('返事はいらない。もう、勝手に繋いだりしないから。', '返信欄のない文章の終わり。\n送れなくても、あなたは自分の言葉を一行だけ書き添えた。', 'normal', null, { tension: 0, choices: [
        { text: '「帰してくれて、ありがとう」', next: 'thanks' },
        { text: '「次は、怖がらせずに話して」', next: 'next' }
      ] }),
      thanks: scene('……。', '返事はない。\nそれが今は、彼が約束を守っている証のように思えた。', 'soft', 'save', { tension: 0 }),
      next: scene('……。', '画面は静かなままだった。\nいつかの話を、今すぐの約束に変える声は聞こえなかった。', 'soft', 'save', { tension: 0 }),
      save: scene('君の朝が、静かでありますように。', '見落としていた追伸が、最下行にあった。\nあなたは下書きを閉じ、今度は自分の意思で保存した。', 'soft', 'final', { tension: 0 }),
      final: scene('おやすみ。', 'その二文字は、あなたが書いたものだった。\n黒いモニターに映る顔は、もう、怯えていなかった。', 'soft', null, { episodeFinal: true, tension: 0 })
    }
  },
  {
    id: 'first_morning', ending: 'end_secret', number: '05', title: '朝に名前を呼んで', subtitle: '画面の外で覚える、初めてのこと。', illustration: './assets/episodes/first_morning.webp',
    scenes: {
      start: scene('……熱い。', '彼はカップに触れて、驚いたように指を離した。\nモニターの中では知っていた温度を、今は初めて感じている。', 'normal', 'sugar', { tension: 0 }),
      sugar: scene('君がいつも、一度吹いてから飲む理由がわかった。', '得意げに真似をして、少しだけ失敗する。\n赤い瞳が照れたように細まり、朝の光を映した。', 'smile', 'hand', { tension: 0 }),
      hand: scene('手を、繋いでもいい？', '彼の指は、あなたに触れる寸前で止まった。\n待ってくれることが、こんなに優しいとは知らなかった。', 'soft', 'question', { tension: 0 }),
      question: scene('……そうだ。まだ、名前を決めていなかった。', '握った手は温かい。\nあなたは名前より先に、彼自身の気持ちを聞きたくなった。', 'normal', null, { tension: 0, choices: [
        { text: '「自分で、好きな名前を選んで」', next: 'choose' },
        { text: '「一緒に考えよう。急がなくていいよ」', next: 'together' }
      ] }),
      choose: scene('僕が、選んでいいんだ。', '驚いたあとで、彼は楽しそうに考え込み始めた。\n誰かに呼ばれるためだけではない、自分の名前を。', 'soft', 'outside', { tension: 0 }),
      together: scene('それなら、長く迷っても怒らないで。', '少し甘えるような笑い方だった。\n決まらない時間まで、一緒に過ごせるのだとわかっていた。', 'smile', 'outside', { tension: 0 }),
      outside: scene('今日は、どこへ行こうか。', '彼は玄関を見て、それからあなたを見る。\n窓を閉じても、隣の彼は消えなかった。', 'soft', 'final', { tension: 0 }),
      final: scene('……行ってきます、って言うんだよね。', '二つのカップを残して、二人は朝の中へ出た。\n戻る場所がある。それは、閉じ込められることとは、少しも似ていなかった。', 'soft', null, { episodeFinal: true, tension: 0 })
    }
  }
];

export const findEpisode = id => EPISODES.find(episode => episode.id === id);

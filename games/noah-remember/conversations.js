(() => {
  'use strict';
  const { scenes } = window.NoahStory;
  const n = (text, art = 'warm-chat', extra = {}) => ({ type: 'line', speaker: 'ノア', text, art, ...extra });
  const p = (text, art = 'warm-chat', extra = {}) => ({ type: 'line', speaker: '', text, art, ...extra });
  const pack = (id, ...steps) => ({ id, steps });
  const groups = {};
  function add(name, ...variants) {
    const choice = scenes[name].steps.at(-1);
    groups[name] = [{ id: 'original', steps: scenes[name].steps }, ...variants.map(variant => ({
      ...variant, steps: choice.type === 'choice' ? [...variant.steps, choice] : variant.steps
    }))];
  }

  add('greeting',
    pack('name-game',
      n('おっけー！　じゃあ、{call}！\n僕はノア。短いから覚えやすいでしょ？', 'warm-laugh'),
      n('一回、呼んでみて。……うん、そう！\n君の声だと、ちょっと違う名前みたい。', 'warm-wake'),
      p('ノアは満足そうに目を細めた。\n自分の名前を、贈り物のように受け取っている。'),
      n('僕の名前より先に、何か浮かんでた？\nここへ来る前のこととか。', 'warm-wake')),
    pack('sleepy-face',
      n('そっか、{call}だね！\n僕はノア。これからよろしく！', 'warm-laugh'),
      n('まだ眠そう。まばたき、ゆっくりだもん。\nふふ、いまにもまた寝ちゃいそう！', 'dark-tease'),
      p('笑いながら、こちらの目が開くのを待っている。\n一度も急かしてこないことに、少し安心した。'),
      n('ねえ、眠る前のことは覚えてる？\n何でもいいよ。最初に浮かんだもの！', 'warm-wake')),
    pack('little-promise',
      n('じゃあ、{call}！\n僕はノアだよ。呼びたくなったら、いつでも呼んで！', 'warm-laugh'),
      n('小さい声でも、ちゃんと聞いてるから。\n聞こえなかったら、もっと近づくね！', 'dark-tease'),
      p('声の主が分かっただけで、部屋の寒さが少し薄れる。\nそれ以外は、まだ何も分からない。'),
      n('今は、どんなことなら思い出せそう？\nここへ来る前、何をしてたのかな。', 'warm-wake'))
  );
  add('nothing',
    pack('empty-page',
      n('まっさらなんだ。\n書きかけのページも、一枚もない？', 'warm-wake'),
      p('答えを探すこちらに、ノアは小さく首を傾ける。'),
      n('じゃあ、今日のことが最初のページだね！\n最初に会うのが僕って、どう？', 'warm-laugh'),
      n('ふふ。まだ感想は出ないか！\nあとで聞かせてね、{call}。', 'dark-tease')),
    pack('pocket',
      n('何にもないかあ。\nポケットを裏返したみたいな感じ？', 'warm-wake'),
      n('僕、なくしものをすると、同じところを何回も見るの。\n今度こそあるかもしれないって！', 'warm-chat'),
      p('自分の胸元に触れた指が、十字架のところで止まった。'),
      n('君も、あとでもう一回探してみよっか！\n僕も一緒に待ってる。', 'warm-laugh')),
    pack('first-answer',
      n('「分からない」って言えるんだね。\nうん、それもちゃんとしたお返事！', 'warm-laugh'),
      n('困った顔で黙っちゃうかなって思ってた。\n{call}、お話してくれるんだ。', 'warm-wake'),
      p('ノアは少しだけ椅子へ身を寄せた。\nこちらの言葉を、一つも逃したくないようだった。', 'dark-tease'),
      n('じゃあ、分かることが増えるまで、おしゃべりしよ！', 'warm-laugh'))
  );
  add('where',
    pack('morning-light',
      n('僕のいるところだよ。\nずっと古い建物だから、お部屋の形が変わってるの。'),
      n('朝になると、あそこだけ明るくなるんだ！\n今日は君のところまで届くかな？', 'warm-proud'),
      p('高い窓の光は、壁の途中で途切れている。\nここが何階なのかさえ、見当がつかなかった。', 'room'),
      n('今は、慌てなくて大丈夫。\n分からないこと、ひとつずつ話そうね！', 'warm-wake')),
    pack('echoes',
      n('声がよく響くところ！\n小さな声でも、ほら、壁が返してくれるでしょ。', 'warm-proud'),
      p('ノアが短く笑うと、遅れてもう一つ笑い声がした。\n厚い石の壁のせいらしい。', 'room'),
      n('慣れると面白いよ！\n足音だけで、誰が来たのか分かったりするの。', 'warm-laugh'),
      n('今は、僕の声だけ聞いてて。\nまだ頭が痛むなら、そのままでいいから。', 'warm-wake')),
    pack('my-chair',
      n('僕がよくいるお部屋。\n君の向かいの椅子、僕のお気に入りなんだ！', 'warm-proud'),
      n('座ると、ちょっとだけ音がするの。\n誰かが動くと、すぐ分かるよ。'),
      p('壁は冷たそうな石でできている。\nノアが当然のように話すほど、見知らぬ場所に思えた。', 'room'),
      n('そのうち慣れるよ、{call}！\n僕、ここにいるからね。', 'warm-laugh'))
  );
  add('sound_avoid',
    pack('count-blinks',
      n('あ、目が合った！\n今、何回まばたきしたか数えてたんだ。', 'warm-laugh'),
      p('ノアはいたずらを見つかったように笑う。\n床を擦る音の記憶が、その笑顔に上書きされた。'),
      n('ふふ、意識すると増えちゃうよね！\nもう数えないから、普通にしてて。', 'dark-tease')),
    pack('good-listener',
      n('ちゃんとうなずいてくれた！\nお話、聞いてくれる人って好き。', 'warm-laugh'),
      n('途中でどこかを見る人もいるんだよ。\n僕の顔、そんなにつまらないのかなあって！', 'dark-tease'),
      p('視線を外しかけて、やめる。\nノアの笑みが、わずかに深くなった。')),
    pack('tilted-head',
      n('ん？　その首の傾げ方、可愛いね。\n僕もやってみよっか！', 'warm-laugh'),
      p('ノアがこちらと同じほうへ首を傾ける。\n思わず見返すと、楽しそうに肩を揺らした。'),
      n('あはは、また見た！\nもう少し、こうしてお話してようよ。', 'dark-tease'))
  );
  add('water',
    pack('ripples',
      p('ノアが器を置く。\n水面を丸い波が渡って、窓の形が崩れた。', 'warm-chat', {sfx:'cup'}),
      n('見て、窓が揺れてる！\n……あ、ごめん。先に飲むほうだよね！', 'warm-laugh'),
      n('急がなくていいよ。\n飲めたら、うなずいて。'),
      p('冷たい水が喉を通った。\nノアは器より、こちらの顔を見ている。'),
      n('どう？　少し、楽になった？', 'warm-wake')),
    pack('careful-hands',
      p('素焼きの器が、机にそっと置かれた。\nノアは両手を離してから、こちらへ向き直る。', 'warm-chat', {sfx:'cup'}),
      n('今回はこぼさなかった！\n……ふふ、何でもない。飲めそう？', 'warm-laugh'),
      n('熱いもののほうがよかったかな。\nでも、今はこれが飲みやすいと思う！', 'warm-wake'),
      p('水を飲む間も、彼は静かに待っていた。\nその視線だけが、頬に残る。'),
      n('ね、{call}。何か言いたそうな顔！', 'dark-tease')),
    pack('little-sips',
      p('ノアが水の入った器を寄せる。\n机と器の触れ合う音が、小さく響いた。', 'warm-chat', {sfx:'cup'}),
      n('ひと口ずつね。\n僕、ちゃんと待てるから！', 'warm-wake'),
      p('喉が潤うにつれ、部屋の冷たい空気を意識した。\nノアは同じ姿勢で、こちらを覗き込んでいる。'),
      n('あれ、そんなに僕を見る？\n飲むたび見られると、僕まで喉が渇いちゃう！', 'warm-laugh'),
      n('……それとも、僕に何か聞きたい？', 'dark-tease'))
  );
  add('thanks',
    pack('another-thankyou',
      n('へえ、そう言ってくれるんだ！', 'warm-wake'),
      n('もう一回してあげたら、\nもう一回「ありがとう」って言う？', 'warm-laugh'),
      p('からかわれているのだろうか。\nノアは答えを知りたくて仕方ない顔をしている。'),
      n('ふふ。じゃあ、覚えておこ！\n{call}は、お礼を言う人。', 'dark-tease')),
    pack('little-reward',
      n('ありがとう、だって！\nなんだか僕がごほうびをもらったみたい！', 'warm-laugh'),
      n('兄さまに言ってもらうのとは、ちょっと違うね。\n君、どんな顔で言うんだろうって思ってた。'),
      p('覗き込むような視線に、少し身が縮む。', 'dark-tease'),
      n('うん、その顔、覚えた！\nまた見せてね！', 'warm-laugh')),
    pack('kind-word',
      n('僕、優しくできてる？\nそっかあ。よかった！', 'warm-laugh'),
      p('まるで答え合わせが済んだように、ノアがうなずく。'),
      n('こういうとき、どうすると嬉しいか、\nちゃんと聞いておいてよかった！', 'warm-proud'),
      n('じゃあ、もう少し僕のお話にも付き合ってね。\nお礼はそれでいいよ、{call}！', 'dark-tease'))
  );
  add('met',
    pack('familiar-voice',
      n('僕の声に、覚えがある？', 'warm-wake'),
      n('大きい声だった？　それとも、こういう声？\n……ねえ、どっちだろうね。', 'dark-tease'),
      p('最後のひと言だけが、耳の近くで響いた。\n記憶を探すより先に、肩が強張る。'),
      n('あはは、ごめん！\n今は、普通の声でお話しよっか！', 'warm-laugh')),
    pack('same-eyes',
      n('そう感じたの、どこを見たとき？\n僕の目？', 'warm-wake'),
      p('ノアは前髪を少しよけた。\n琥珀色の瞳が、光の下にあらわになる。'),
      n('よく見ていいよ。逃げないから！\nね、何か見つかりそう？', 'dark-tease'),
      n('……まだかあ。\nじゃあ、今日は覚えてもらえるように頑張ろ！', 'warm-laugh')),
    pack('one-sided-memory',
      n('会ったこと、あるのかなあ。\n君がそう思うなら、そうかもしれないね！', 'warm-laugh'),
      p('否定も肯定もせず、ノアはこちらの様子を眺める。'),
      n('僕だけが答えを言うより、\n君が見つけるところを見たいな。', 'dark-tease'),
      n('ふふ、意地悪？\nじゃあ、思い出したら僕にも質問していいよ！', 'warm-laugh'))
  );
  add('close',
    pack('one-hand',
      n('これくらい？\n……あ、まだ近い？', 'dark-tease'),
      p('ノアは自分の手の幅だけ、椅子を引いた。\n遠ざかったというより、距離を測られた気がする。', 'warm-chat', {sfx:'chair'}),
      n('うん。ここからでもよく見える！\n慣れたら、さっきの場所に戻っていい？', 'warm-laugh')),
    pack('small-retreat',
      n('そっかあ。\n近いほうが、聞き間違えなくていいのに！', 'warm-laugh'),
      p('椅子が短い音を立てた。\nノアの目線は、少しも離れない。', 'warm-chat', {sfx:'chair'}),
      n('じゃあ、ここにいるね。\n小さな声で呼んだら、すぐ戻っちゃうけど！', 'dark-tease')),
    pack('measure-smile',
      n('ふうん。ちゃんと言ってくれるんだ！\n黙って我慢するかと思った。', 'warm-wake'),
      p('ノアは笑いながら少し離れた。\n何か一つ、こちらについて知れたような顔だった。', 'warm-chat', {sfx:'chair'}),
      n('これで安心？\nね、{call}の「ちょうどいい」を教えてね！', 'warm-laugh'))
  );
  add('outside_talk',
    pack('rain-and-sea',
      p('高窓から、かすかな風の音がする。\nノアは光の当たる壁を見上げた。', 'room'),
      n('外には、雨の日の匂いってあるんだって！\n本にはそう書いてあった。', 'warm-proud'),
      n('物心ついたときから、ずっとここだから。\n僕、外のことはあんまり知らないの。'),
      n('海も、本で見ただけ。\nあんなに水があるのに、雨が降っても大丈夫なのかな！', 'warm-laugh')),
    pack('map-edge',
      p('遠くで鳥が鳴いた。\nノアは聞き慣れた音らしく、顔も上げなかった。', 'room', {sfx:'bird'}),
      n('地図って、面白いよね！\n端っこまで描いてあるのに、その先もあるんだって。', 'warm-proud'),
      n('僕は物心ついてから、ずっとここ。\n歩いて確かめたことはないんだ。'),
      n('青いところは、海でしょ？\n空みたいな色の水って、ほんとにあるのかなあ。', 'warm-wake')),
    pack('night-sky',
      p('高窓の光を目で追っていると、ノアもそちらを見た。', 'room'),
      n('その窓、夜は真っ黒になるよ！\n星が見える日もあるけど、ちょっとだけ。', 'warm-proud'),
      n('外から見た空は、知らないんだ。\n物心ついたときには、もうここにいたから。'),
      n('本にね、海に星が映るって書いてあったの！\nじゃあ、下を向いても夜空が見えるんだね！', 'warm-laugh'))
  );
  add('sea',
    pack('bring-a-bottle',
      n('見てみたい！\n小さい瓶に入れたら、兄さまにも見せられるかな？', 'warm-proud'),
      n('……それだと、ただの水？\nそっかあ。じゃあ、一緒に行くほうがいいね！', 'warm-laugh'),
      n('{call}が思い出したら、教えて。\n本にないことも聞きたいな！', 'warm-wake')),
    pack('sound-of-waves',
      n('うん！　音も聞いてみたい！\nずっと水が動いてるなんて、眠れなくならない？', 'warm-laugh'),
      n('兄さまなら、どういう音か知ってるかなあ。\n今度、まねしてもらお！', 'warm-proud'),
      n('君も思い出したら、聞かせてね！\nどっちが上手か、僕が聞くから！', 'dark-tease')),
    pack('farther-than-window',
      n('見たいなあ。\n向こうの壁がないって、どんな感じなんだろ！', 'warm-wake'),
      p('ノアは両手で幅を示してから、足りないと思ったのかやめた。'),
      n('兄さまと一緒なら、迷子にならないよね！\n{call}も、何か思い出したら教えて！', 'warm-laugh'))
  );
  add('leave_talk',
    pack('company-here',
      n('出たら、兄さまが帰ってきたとき会えないでしょ？\nそれは、ちょっと嫌だなあ。'),
      n('待ってると、いろんな人が来るし！\n今日は君が来た。ほら、ちゃんと面白いことがある！', 'warm-laugh'),
      n('今は、ここにいたいな。\n{call}と、まだお話してる途中だもん。', 'dark-tease')),
    pack('outside-stories',
      n('外の話を聞くのは好き！\n出かけるのは、まだ考えたことないなあ。', 'warm-proud'),
      n('来た人に聞くと、みんな違うことを言うんだ。\n同じ空の話なのに、不思議だよね！', 'warm-laugh'),
      n('君は、どんな話を持ってきたんだろう。\n思い出すの、楽しみだね！', 'dark-tease')),
    pack('waiting-place',
      n('うーん。ここにいたほうが、\n誰かが来たとき、すぐ分かるから。'),
      p('誰か、という言葉だけが、少し長く口元に残った。'),
      n('兄さまもいるしね！\n今は可愛い{call}もいる。どこに行くの？', 'warm-laugh'))
  );
  add('dog',
    pack('taken-first',
      p('窓の外で、犬が二度吠えた。\nノアは話しかけようとした口を、そのまま閉じる。', 'room', {sfx:'distant'}),
      n('……犬だ。\n{call}は、あの声、好き？'),
      p('胸元の十字架をつまんで、ノアが小さく笑う。'),
      n('僕は嫌い。大事なものを、\n僕より先に持っていかれた気がするんだ。', 'dark-bored'),
      n('ふふ、変でしょ？\n何だったかも、ちゃんと出てこないのに！', 'warm-laugh')),
    pack('smile-goes-still',
      p('遠くから犬の鳴き声が届く。\nノアの笑顔が、一瞬だけ動かなくなった。', 'warm-chat', {sfx:'distant'}),
      n('犬って、みんな好きって言うよね！\n{call}も、そう？', 'warm-laugh'),
      p('軽い声とは反対に、指は十字架の鎖を強く引いていた。'),
      n('僕は嫌いなんだ。\n何か大事なものを、取られた気がするから。', 'dark-bored'),
      n('……取られた、で合ってるのかな。\nうん。でも、嫌いなのは間違いないよ！', 'warm-laugh')),
    pack('give-it-back',
      p('高窓の向こうで、犬が短く吠えた。\nノアは音のほうへ、ゆっくり顔を向ける。', 'room', {sfx:'distant'}),
      n('僕、犬は嫌い。\nあの声を聞くと、「返して」って言いたくなるの。', 'dark-bored'),
      p('何を、と尋ねる前に、ノアがこちらへ笑いかけた。'),
      n('大事なものを取られた気がするんだよね！\n何だったかは、よく分からないんだけど！', 'warm-laugh'),
      p('言い終えても、十字架をつまむ指はほどけなかった。', 'dark-bored'))
  );
  add('important',
    pack('guessing-game',
      n('何だろうね！\n可愛い{call}なら、当ててくれる？', 'dark-tease'),
      p('遊びに誘うような声なのに、彼の指は十字架から離れない。'),
      n('……って、僕が答えを知らなかったら、\n正解かどうか分かんないか！', 'warm-laugh'),
      n('じゃあ、この問題はあとにしよ！\n分かったら、僕から教えてあげる。', 'warm-chat')),
    pack('not-the-cross',
      n('あ、これだと思った？', 'dark-tease'),
      p('ノアが十字架を持ち上げる。\n銀色の先が、小さく光を返した。'),
      n('これは、ここにあるよ！\nなくなったものは……。', 'warm-laugh'),
      p('視線が止まる。\nそこだけ、言葉の続きが見つからないようだった。'),
      n('ふふ、内緒にしとこっか！\n何でも教えちゃったら、つまんないでしょ？', 'dark-tease')),
    pack('answer-slips',
      n('大事だったんだと思うよ。\nだって、今でも取られた気がするんだもん！', 'warm-laugh'),
      p('質問の答えになっていないことを、ノアは気にしていない。'),
      n('名前が出てきそうだったんだけどなあ。\n今、どこへ行っちゃったんだろ。'),
      n('……ね、今度は僕の質問に答えて！\n{call}のことも、知りたいな！', 'dark-tease'))
  );
  add('dog_silence',
    pack('staring-back',
      n('……なあに？\n黙って見られると、僕も見ちゃうよ！', 'dark-tease'),
      p('ノアがこちらの顔を覗き込む。\n十字架から離した指で、自分の頬に触れた。'),
      n('ふふ、どっちが先に笑うかな！\n……あ、僕が先だったね。', 'warm-laugh'),
      n('犬の話はおしまい！\nもっと楽しいお話にしよっか。', 'warm-chat')),
    pack('no-pity',
      n('あれ、どうしたの？\n僕、泣いたりしないよ！', 'warm-laugh'),
      p('ノアは楽しそうに首を傾ける。\nこちらが何を気にしているのか、分からないようだった。'),
      n('嫌いなものの話、長くしててもつまんないね！\n好きなものの話にしよ！', 'warm-proud')),
    pack('listen-to-me',
      n('何も聞かないんだ。\nふうん、{call}ってそういう人なんだね！', 'warm-laugh'),
      p('しばらくこちらを眺めてから、ノアは窓に背を向けた。'),
      n('犬の声より、僕の声のほうがいいでしょ？\nじゃあ、こっちを見てて！', 'dark-tease'),
      n('まだお話したいこと、いっぱいあるから！', 'warm-laugh'))
  );

  // Keep the remembered metal sound and its clue choice after every brother anecdote.
  const brotherClue = scenes.brother.steps.slice(-3, -1);
  add('brother',
    pack('beautiful-writing',
      n('兄さまはね、字を書く手まできれいなんだよ！\n僕、横から見るの好き！', 'warm-proud'),
      n('紙を見てなくても、ちゃんとお話を聞いてるの。\nさっきと違うことを言うと、すぐ気づくんだ！', 'warm-laugh'),
      p('ノアは、自分が褒められているように胸を張る。', 'warm-proud'),
      n('力加減も、すっごく上手！\nもう壊れそうってところで、ぴたっと止められるの。', 'warm-proud'),
      n('僕は、次の顔が見たくて続けちゃう。\nそれで、すぐ壊しちゃうんだよね！', 'warm-laugh'),
      p('困った癖を話すような調子だった。\nそこで失われたものに、関心はないらしい。'),
      n('今日は僕に任せてくれたんだ！\n上手にできたら、また頭を撫でてくれるかな！', 'warm-proud'),
      ...brotherClue),
    pack('copying-a-smile',
      n('兄さまって、すごいんだよ！\n大きな声を出さなくても、みんな顔を上げるの！', 'warm-proud'),
      n('僕もまねしてみたんだ。\nこうやって、ちょっとだけ笑って！', 'dark-tease'),
      p('ノアは口元を静かな笑みに変える。\nけれど、すぐに楽しそうな笑い声がこぼれた。', 'warm-laugh'),
      n('あはは、やっぱり違うね！\n兄さまは、待つのも力加減も上手なんだ！', 'warm-proud'),
      n('僕は我慢できなくなっちゃう。\nもう一回って思うと、すぐ壊れるんだもん！', 'warm-laugh'),
      p('何が壊れるのか、ノアは当然分かるだろうという顔をしている。'),
      n('でも今日は、僕の番にしてくれたんだよ！\n戻ってきたら、上手にできたって言うんだ！', 'warm-proud'),
      ...brotherClue),
    pack('earned-praise',
      n('兄さまに「よくできました」って言われるの、\n僕、すっごく好きなんだ！', 'warm-proud'),
      n('何でも褒めてくれるわけじゃないよ。\nだから、言ってもらうと本当だって分かるの！', 'warm-laugh'),
      p('ノアは誇らしげに笑う。\n彼のことなら、いくらでも話せるようだった。', 'warm-proud'),
      n('この間は、もっと力加減を覚えなさいって！\n兄さまなら、壊れる前に止められるんだけどね。'),
      n('僕は下手だから、すぐ壊しちゃうの。\nまだ聞きたい声も、見たい顔もあったのになあ！', 'warm-laugh'),
      p('残念そうなのは、終わってしまったことだけだった。'),
      n('今日は兄さまから任されたんだよ！\n{call}も、最後まで付き合ってね！', 'dark-tease'),
      ...brotherClue)
  );

  add('searching_echo',
    pack('almost-name',
      p('ノアが何か言いかけて、やめた。\n口の中で、短い音を確かめている。'),
      n('……誰かの名前、だった気がする。'),
      n('呼ばなくちゃって思ったんだけど。\n誰を呼ぶんだっけ？', 'warm-wake'),
      p('質問は、こちらに向いていなかった。\nノアは十字架から指を離す。'),
      n('まあ、思い出したら呼べばいいか！\nね、兄さまの話、聞いてくれる？', 'warm-laugh')),
    pack('missing-presence',
      p('ノアが空いた隣の椅子を見る。\nそこに誰かが座ったように、視線が一度止まった。'),
      n('……足りないなあ。'),
      n('何が、だろうね。\n誰かを探してた気がするんだけど。'),
      p('思い出そうとする表情は、一瞬で消えた。'),
      n('あ、君がいなくなったわけじゃないよね！\nふふ。じゃあ、大丈夫！', 'dark-tease'),
      n('そうだ、兄さまの話！\nまだちゃんとしてなかったね。', 'warm-proud')),
    pack('familiar-footsteps',
      p('廊下で遠い足音がした。\nノアは扉を見て、すぐこちらへ向き直る。', 'room', {sfx:'steps'}),
      n('……違った。'),
      n('今、誰だと思ったんだろう。\n会いたい人がいるような気がしたのに。'),
      p('自分の言葉を不思議がるように、彼は笑った。'),
      n('ま、いっか！　そのうち分かるよね！\n今は兄さまのお話をしよ！', 'warm-laugh'))
  );
  add('brother_more',
    pack('patient-brother',
      n('兄さまは、待つのも上手なんだよ！\n僕なら、もう次にしちゃうところでも！', 'warm-proud'),
      n('手を止めて、顔を見るの。\nそうすると、その人が自分からお話しするんだ。'),
      n('僕もまねしたんだけど、途中で待てなくなっちゃった！\nお仕置きって、難しいね！', 'warm-laugh'),
      p('ノアは勉強の失敗を打ち明けるように笑った。\nさっき聞こえた金属音が、頭の奥で遠ざかる。')),
    pack('white-gloves-no',
      n('兄さまの黒い手袋、かっこいいよね！\n指を曲げても、しわがきれいなの。', 'warm-proud'),
      n('僕、同じ動きをしてみたことがあるよ。\nでも、力を入れすぎちゃって！', 'warm-laugh'),
      n('兄さまは「ここまで」って、ちゃんと分かるんだ。\n僕にはまだ、よく分かんないや。'),
      p('何に力を入れたのかは語られなかった。\nノアは楽しそうに、自分の指を曲げている。')),
    pack('praise',
      n('兄さまに褒めてもらうと、嬉しいんだ！\n頭を撫でてくれることもあるよ。', 'warm-proud'),
      n('「最後まで話を聞きなさい」って、よく言われるの。\n僕、途中で面白い顔を見つけちゃうから！', 'warm-laugh'),
      n('今日こそ、最後までできるといいな。\n{call}も、付き合ってくれるよね！', 'dark-tease'),
      p('明るい声に返事を探しているうちに、\n金属音から浮かびかけた景色は消えていた。'))
  );
  add('cannot_count',
    pack('lasting-toy',
      n('そうそう、すぐ壊れないの！\nでも、ただ丈夫なだけじゃ足りないなあ。', 'warm-laugh'),
      n('同じことをしても、違う顔を見せてくれるのがいい！\nまだ続きがあるって思えるでしょ？', 'dark-tease'),
      n('僕、途中でおしまいになるの、嫌なんだ。\n壊しがいのあるオモチャって、どこにあるんだろうね！', 'noah-fixation'),
      p('ノアは探しものを見つけたように、こちらへ顔を寄せた。\nもう答えを探している目ではなかった。', 'noah-fixation')),
    pack('take-one-away',
      n('うん！　何かをひとつ奪っても、\nまだ大丈夫って言ってくれるの！', 'warm-laugh'),
      n('じゃあ、もうひとつならどうかな？\nその次は？　って、気になっちゃうよね！', 'dark-tease'),
      n('兄さまは、そこで止められるんだ。\n僕は、答えが見たくて仕方なくなっちゃう！', 'noah-fixation'),
      p('オモチャの話だったはずなのに、\nノアは一度もこちらから目を離さなかった。', 'noah-fixation')),
    pack('answering-toy',
      n('丈夫なの、大事！\nあとは、お返事してくれること！', 'warm-laugh'),
      n('返事が変わると面白いんだよ。\n最初は嫌って言うのに、あとでは別のことを言うの！', 'dark-tease'),
      n('その先も聞きたいんだけど、すぐ壊れちゃうんだ。\n今度のオモチャは、長く遊べるといいなあ！', 'noah-fixation'),
      p('今度、という言葉に合わせて、ノアの指がこちらを向く。', 'noah-fixation'))
  );
  add('why_count',
    pack('hidden-face',
      n('だって、いつもと違うところが見えるから！\n壊れそうになるまで、隠してるんだもん。', 'warm-laugh'),
      n('そんなに大切にしまってるなら、\n見たくなるの、普通だよね！', 'dark-tease'),
      p('ノアは同意を待たず、嬉しそうに先を続ける。'),
      n('{call}も、まだ見せてない顔がある？\n僕、ぜんぶ知りたいな！', 'noah-fixation')),
    pack('how-far',
      n('どこまで大丈夫なのかなって、気にならない？\nまだ平気って顔を見ると、もっと知りたくなるの！', 'warm-laugh'),
      n('途中でやめると、続きが分からないでしょ？\n僕、そういうの苦手！', 'dark-tease'),
      p('口調は、一緒に本の続きを読もうと誘う子供のようだった。'),
      n('今度は最後まで付き合ってね、{call}！\nすぐ壊れないでくれると嬉しいな！', 'noah-fixation')),
    pack('moving-target',
      n('壊したいっていうか、\nその手前を、もうちょっと見てたいんだよ！', 'warm-laugh'),
      n('でも、もうちょっとって思ってるうちに終わるの。\nだから、もっと丈夫なオモチャがほしくなるんだ。'),
      p('失敗を反省しているのではない。\n次の相手を選ぶ話をしている。', 'dark-tease'),
      n('ね、{call}なら、どのくらい？\nああ、早く確かめたいな！', 'noah-fixation'))
  );
  add('corridor_visitors',
    pack('unfinished-report',
      p('扉を二度叩く音がした。\n三度目は、ためらったように小さかった。', 'room', {sfx:'door'}),
      {type:'line',speaker:'扉の向こうの声',text:'ノア様、処理のご報告を……。こちらで失礼いたします。',art:'room'},
      n('入ってくればいいのに！\n……あ、行っちゃった。', 'warm-laugh'),
      p('足音だけが早くなる。\nノアが返事をする前に、もう遠ざかっていた。', 'room', {sfx:'steps'}),
      n('異端者を狩る天才、なんて言うくせにね！\nみんな、僕の前だと声が小さくなるんだよ。', 'warm-proud'),
      n('僕、そんなに耳が悪そうに見える？', 'warm-laugh'),
      p('彼の指の下で、鉄の留め金が曲がる。\nノアは不思議そうにそれを見てから、笑った。', 'warm-chat', {sfx:'metal'}),
      n('あれ、また壊れた！\nこんなのじゃ、練習にもならないよね！', 'warm-laugh')),
    pack('steps-stop',
      p('扉の前で足音が止まった。\n長い沈黙のあと、ようやく声がする。', 'room', {sfx:'steps'}),
      {type:'line',speaker:'扉の向こうの声',text:'ノア様。異端者の処理は、あの方のご指示どおりに。',art:'room'},
      n('うん！　兄さまに、僕はちゃんと待ってるって伝えて！', 'warm-proud'),
      p('承知しました、という返事がかすれる。\n扉は最後まで開かなかった。', 'room'),
      n('教団の人って、変だよね！\n僕の力を褒めるときだけ、少し離れるの。', 'warm-laugh'),
      n('この歳であんなに狩れるなんて、って。\nやってみたら、できただけなんだけど！', 'warm-proud'),
      p('白い袖を直す指が、机の鉄金具に引っかかった。\n金具のほうが、簡単に形を変えた。', 'warm-chat', {sfx:'metal'}),
      n('あはは！　また兄さまに、力加減って言われちゃう！', 'warm-laugh')),
    pack('do-not-enter',
      p('鍵穴の向こうで、金属が小さく鳴った。\n誰かが扉の前にいる。', 'room', {sfx:'metal'}),
      {type:'line',speaker:'扉の向こうの声',text:'ノア様、ご機嫌を損ねるつもりは……処理の確認だけです。',art:'room'},
      n('僕、機嫌いいよ！\n今、可愛い{call}と遊んでるんだもん！', 'warm-laugh'),
      p('返事は聞き取れなかった。\n靴音が急ぎ足で遠ざかる。', 'room', {sfx:'steps'}),
      n('みんな、僕には一人で近づかないようにしてるの。\n神童だって言うなら、お話くらいしてくれたらいいのに！', 'warm-proud'),
      n('異端者を狩るときより、こっちのほうが難しいや！', 'warm-laugh'),
      p('ノアが指で押した鉄の輪は、戻らない形に歪んだ。\n彼だけが、その変化を気にしていない。', 'warm-chat', {sfx:'metal'}))
  );
  add('toys_and_absences',
    pack('quiet-rooms',
      n('処理って、お片づけのことだよ！\nお遊戯のあとは、ちゃんとお部屋を空けなくちゃ。', 'warm-proud'),
      n('「排除を完了しました」って言う人もいるけど。\nもっと短く言えばいいのにね！', 'warm-laugh'),
      p('隣の部屋からは、何の音もしない。', 'room'),
      n('前にいた人？　もういないよ。\nここに来た人は、出られないから。'),
      n('帰ったんじゃないの。みんないなくなるの！\n僕、まだ遊びたかったのになあ。', 'dark-tease'),
      p('ノアは少し考えて、誰もいないところへ目を向けた。'),
      n('……探してた人も、ここにいた？\n違うかな。思い出せないや。'),
      n('まあ、今は君がいる！\n今度こそ、長く遊ぼうね！', 'noah-fixation')),
    pack('no-goodbye',
      n('お片づけを忘れると、兄さまに叱られるんだ。\n僕、お遊戯のことばっかり考えちゃうから！', 'warm-proud'),
      n('教団の人は、排除とか処理とか言うよ。\n僕は、終わったオモチャって呼んでる！', 'warm-laugh'),
      p('何を聞いているのか、理解が追いつかない。\n彼だけが普段どおりだった。'),
      n('さよならは、あんまり言わないなあ。\n帰るわけじゃないもん。ここに来た人は、帰れないよ。', 'dark-tease'),
      n('気づくと、みんないなくなるの。\nだから、すぐ壊すともったいないよね！', 'warm-laugh'),
      n('……あの人には、まだ……。'),
      p('ノアの声が途切れる。\n何を続けるつもりだったのか、本人にも分からないらしい。'),
      n('んー、忘れちゃった！\n{call}の顔を見てたら、どうでもよくなった！', 'dark-tease')),
    pack('empty-chair',
      n('処理の話かあ。\n僕は、終わったあとのことって退屈なんだよね！', 'warm-laugh'),
      n('排除って言われても、もうお返事しないんだもん。\n次のお遊戯のほうが楽しいよ！'),
      p('ノアが隣の椅子に目を向ける。\nそこにも、以前は誰かが座っていたのだろうか。', 'room'),
      n('ここに来た人は、出られないよ。\n君も、帰れないの。知らなかった？', 'dark-tease'),
      n('みんないなくなるまで、僕が待ってると思う？\nふふ、そんなに上手に待てないや！', 'warm-laugh'),
      p('ノアは笑い終えてから、急に黙った。'),
      n('……でも、誰かを待ってた気がする。\n探しに行かなきゃって、思ってたような。'),
      n('誰だったかな。……ま、あとで考えよ！\n今は{call}の番だもんね！', 'noah-fixation'))
  );
  const lastStart = scenes.last_wait.steps.slice(0, 3);
  const lastQuestion = scenes.last_wait.steps.slice(-2);
  add('last_wait',
    pack('patient-fingers', ...lastStart,
      p('ノアの指が、椅子の端を何度もなぞる。\n同じ場所の木肌だけが、少しずつ削れていく。', 'noah-fixation'),
      n('僕、さっきからずっと待ってるんだよ！\nこんなに待ったら、兄さまも褒めてくれるかな！', 'noah-fixation'),
      n('でも、もう待ちきれないかも！\n{call}の次の顔、早く見たいなあ！', 'noah-fixation'),
      ...lastQuestion),
    pack('almost-touching', ...lastStart,
      p('こちらへ伸びた手が、触れる直前で止まった。\nノアは楽しそうに、その距離を眺めている。', 'noah-fixation'),
      n('もう少しだけ、我慢しよ！\n今、思い出しかけてるかもしれないもんね！', 'noah-fixation'),
      n('ああ、でも、触ったらどんな顔するんだろう。\n……ねえ、僕のこと、待たせすぎじゃない？', 'noah-fixation'),
      ...lastQuestion),
    pack('counting-time', ...lastStart,
      n('どのくらい待ったと思う？\n僕、途中まで数えてたんだけど、分かんなくなっちゃった！', 'noah-fixation'),
      p('ノアの笑顔は変わらない。\n椅子を握る指だけが、ゆっくり強くなる。', 'noah-fixation', {sfx:'chair'}),
      n('君のことを見てると、次のことばっかり考えちゃう。\nどんな声かな。どんな顔かな。早く知りたいなあ！', 'noah-fixation'),
      ...lastQuestion)
  );

  const introduced = Object.fromEntries(Object.keys(groups).map(name => [name,
    ['dog', 'important', 'dog_silence', 'brother'].includes(name) ? 4 : 3
  ]));
  function upgradeChoices(value, fromRevision) {
    const result = {};
    for (const [name, variants] of Object.entries(groups)) {
      if (variants.some(v => v.id === value?.[name])) result[name] = value[name];
      else if (fromRevision < introduced[name]) result[name] = 'original';
    }
    return result;
  }
  function cleanUsage(value) {
    const result = {};
    for (const [name, variants] of Object.entries(groups)) {
      const previous = value?.[name];
      result[name] = {
        last: variants.some(v => v.id === previous?.last) ? previous.last : null,
        counts: Object.fromEntries(variants.map(v => [v.id,
          Number.isSafeInteger(previous?.counts?.[v.id]) && previous.counts[v.id] >= 0 ? previous.counts[v.id] : 0
        ]))
      };
    }
    return result;
  }
  function ensure(state, usage, random = Math.random) {
    const variants = groups[state.scene];
    if (!variants) return;
    state.conversations ||= {};
    if (variants.some(v => v.id === state.conversations[state.scene])) return;
    const record = usage[state.scene];
    const least = Math.min(...variants.map(v => record.counts[v.id]));
    let candidates = variants.filter(v => record.counts[v.id] === least);
    const different = candidates.filter(v => v.id !== record.last);
    if (different.length) candidates = different;
    const index = Math.min(candidates.length - 1, Math.max(0, Math.floor(random() * candidates.length)));
    const chosen = candidates[index].id;
    state.conversations[state.scene] = chosen;
    record.counts[chosen]++;
    record.last = chosen;
  }
  function resolve(state) {
    const original = scenes[state.scene];
    const selected = groups[state.scene]?.find(v => v.id === state.conversations?.[state.scene]);
    return selected ? { ...original, steps: selected.steps } : original;
  }
  function readKey(state) {
    return `${state.scene}@${state.conversations?.[state.scene] || 'original'}:${state.index}`;
  }
  function legacyChoices() {
    return Object.fromEntries(Object.keys(groups).map(name => [name, 'original']));
  }
  // Saved logs contain literal text, so also correct wording from earlier versions.
  // 「兄さま」 is Noah's personal name for someone he admires, not a blood relation.
  function correctHistory(history) {
    const corrections = new Map([
      ['ノア様。異端者の処理は、兄君のご指示どおりに。', 'ノア様。異端者の処理は、あの方のご指示どおりに。'],
      ['ノアは誇らしげに笑う。\n兄さまのことなら、いくらでも話せるようだった。', 'ノアは誇らしげに笑う。\n彼のことなら、いくらでも話せるようだった。'],
      ['兄さまの話を、もっと聞く', 'あの人の話を、もっと聞く']
    ]);
    return history.map(entry => entry?.speaker !== 'ノア' && corrections.has(entry?.text)
      ? { ...entry, text: corrections.get(entry.text) } : entry);
  }
  window.NoahConversations = { groups, introduced, upgradeChoices, cleanUsage, ensure, resolve, readKey, legacyChoices, correctHistory };
})();

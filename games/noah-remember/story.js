// Local story data. Memory fragments preserve the player's first-person view.
window.NoahStory = {
  "scenes": {
    "opening": {
      "title": "目をあけて",
      "steps": [
        {
          "type": "line",
          "speaker": "",
          "text": "まぶたの向こうに、細い光がある。",
          "art": "warm-wake",
          "effect": "wake"
        },
        {
          "type": "line",
          "speaker": "ノア",
          "text": "頭を打ったって聞いたけど、大丈夫？",
          "art": "warm-wake"
        },
        {
          "type": "line",
          "speaker": "ノア",
          "text": "僕の声、聞こえる？\n……うん。よかった！",
          "art": "warm-wake"
        },
        {
          "type": "line",
          "speaker": "",
          "text": "白いシャツの青年が、こちらの目を覗き込んでいる。\n柔らかな髪の先に、窓の光が透けていた。",
          "art": "warm-wake"
        },
        {
          "type": "line",
          "speaker": "ノア",
          "text": "あ、急に起きなくていいよ。そのまま、そのまま。\n目が回っちゃったら大変だもんね！",
          "art": "warm-chat"
        },
        {
          "type": "line",
          "speaker": "ノア",
          "text": "そうだ。君のこと、どう呼ぼうかな。\nお兄さん？　それとも、お姉さん？",
          "art": "warm-chat"
        },
        {
          "type": "choice",
          "text": "あなたについて、教える。",
          "options": [
            {
              "label": "男性",
              "gender": "male",
              "next": "greeting"
            },
            {
              "label": "女性",
              "gender": "female",
              "next": "greeting"
            }
          ],
          "art": "warm-chat"
        }
      ]
    },
    "greeting": {
      "title": "目をあけて",
      "steps": [
        {
          "type": "line",
          "speaker": "ノア",
          "text": "じゃあ、{call}だね！\n僕はノア。よろしく！",
          "art": "warm-laugh"
        },
        {
          "type": "line",
          "speaker": "",
          "text": "差し出されかけた手が、途中で引っ込む。\nノアは自分の胸元に触れて、小さく笑った。",
          "art": "warm-chat"
        },
        {
          "type": "line",
          "speaker": "ノア",
          "text": "握手はあとにしよっか。\nまだ、ぼんやりしてるみたいだし。",
          "art": "warm-chat"
        },
        {
          "type": "line",
          "speaker": "ノア",
          "text": "いま、何か覚えてる？\nここへ来る前のこととか。",
          "art": "warm-wake"
        },
        {
          "type": "choice",
          "text": "目を閉じて、探ってみる。",
          "options": [
            {
              "label": "何も、思い出せない",
              "next": "nothing"
            },
            {
              "label": "ここは、どこ？",
              "next": "where"
            }
          ],
          "art": "warm-wake"
        }
      ]
    },
    "nothing": {
      "title": "目をあけて",
      "steps": [
        {
          "type": "line",
          "speaker": "ノア",
          "text": "そっか。空っぽなんだ。",
          "art": "warm-chat"
        },
        {
          "type": "line",
          "speaker": "",
          "text": "ノアは同じ言葉を、口の中でもう一度転がした。",
          "art": "warm-chat"
        },
        {
          "type": "line",
          "speaker": "ノア",
          "text": "じゃあ、ひとつずつ入れていこうよ！\nまずは僕の名前。ノア。覚えた？",
          "art": "warm-laugh"
        },
        {
          "type": "line",
          "speaker": "ノア",
          "text": "ふふ、上手！\n僕の名前を呼ぶときの顔、可愛いね。",
          "art": "dark-tease"
        }
      ],
      "next": "room_intro"
    },
    "where": {
      "title": "目をあけて",
      "steps": [
        {
          "type": "line",
          "speaker": "ノア",
          "text": "僕がずっと暮らしてるところ。\n古い建物だから、ちょっと寒いんだ。",
          "art": "warm-chat"
        },
        {
          "type": "line",
          "speaker": "ノア",
          "text": "でも、この時間は窓から光が入るよ。\nほら。あそこ、きれいでしょ！",
          "art": "warm-proud"
        },
        {
          "type": "line",
          "speaker": "",
          "text": "彼の指が示した先に、小さな高窓が見える。\nその下まで光が届くには、まだ時間がかかりそうだった。",
          "art": "room"
        },
        {
          "type": "line",
          "speaker": "ノア",
          "text": "詳しい話は、頭がすっきりしてから。\n今日は僕が一緒にいるからね！",
          "art": "warm-wake"
        }
      ],
      "next": "room_intro"
    },
    "room_intro": {
      "title": "小さなおしゃべり",
      "steps": [
        {
          "type": "line",
          "speaker": "",
          "text": "ノアが椅子を引き寄せる。\n石の床を、木の脚がゆっくり擦った。",
          "art": "warm-chat",
          "sfx": "chair"
        },
        {
          "type": "line",
          "speaker": "",
          "text": "――その音を、どこかで聞いた。",
          "art": "warm-chat",
          "effect": "pulse"
        },
        {
          "type": "line",
          "speaker": "ノア",
          "text": "近すぎる？\n{call}の声、ちゃんと聞きたいんだ。",
          "art": "dark-tease"
        },
        {
          "type": "choice",
          "text": "擦れる音の余韻が、耳に残る。",
          "options": [
            {
              "label": "その音を、もう一度思い出す",
              "next": "sound_memory",
              "score": 1,
              "clue": "chair"
            },
            {
              "label": "ノアの顔を見て、うなずく",
              "next": "sound_avoid"
            }
          ],
          "art": "dark-tease"
        }
      ]
    },
    "sound_memory": {
      "title": "小さなおしゃべり",
      "steps": [
        {
          "type": "line",
          "speaker": "",
          "text": "椅子の脚が止まる。\n机の向こうで、黒いものが動いた気がした。",
          "art": "room",
          "effect": "memory",
          "sfx": "chair"
        },
        {
          "type": "line",
          "speaker": "",
          "text": "指の形。革の光沢。\nそこまで浮かんで、輪郭がほどける。",
          "art": "room"
        },
        {
          "type": "line",
          "speaker": "ノア",
          "text": "あれ。いま、どこを見てたの？",
          "art": "warm-wake"
        },
        {
          "type": "line",
          "speaker": "ノア",
          "text": "僕の向こう？\nふうん。そこに何かあったんだ。",
          "art": "dark-tease"
        },
        {
          "type": "line",
          "speaker": "ノア",
          "text": "急がなくていいよ。\n見えたものは、あとで教えてね！",
          "art": "warm-laugh"
        }
      ],
      "next": "water"
    },
    "sound_avoid": {
      "title": "小さなおしゃべり",
      "steps": [
        {
          "type": "line",
          "speaker": "ノア",
          "text": "あはは、素直！\n可愛い{call}だね。",
          "art": "warm-laugh"
        },
        {
          "type": "line",
          "speaker": "",
          "text": "青年の笑い声に、さっきの音が紛れていく。",
          "art": "warm-chat"
        },
        {
          "type": "line",
          "speaker": "ノア",
          "text": "大丈夫。分からないことは、僕に聞いて。\nここにあるもののことなら、詳しいから！",
          "art": "warm-proud"
        }
      ],
      "next": "water"
    },
    "water": {
      "title": "小さなおしゃべり",
      "steps": [
        {
          "type": "line",
          "speaker": "",
          "text": "ノアが机の端に、素焼きの器を置いた。\n水面に、高窓が小さく揺れている。",
          "art": "warm-chat",
          "sfx": "cup"
        },
        {
          "type": "line",
          "speaker": "ノア",
          "text": "飲めそう？　少しずつね。\nこぼれたら拭いてあげる。",
          "art": "warm-wake"
        },
        {
          "type": "line",
          "speaker": "",
          "text": "喉を通る水が冷たい。\n自分がひどく渇いていたことに、今さら気づいた。",
          "art": "warm-chat"
        },
        {
          "type": "line",
          "speaker": "ノア",
          "text": "そんなに見つめて、どうしたの？\n僕の顔に何かついてる？",
          "art": "dark-tease"
        },
        {
          "type": "choice",
          "text": "ノアの目が、返事を待っている。",
          "options": [
            {
              "label": "優しくしてくれて、ありがとう",
              "next": "thanks"
            },
            {
              "label": "前にも、会ったことがある？",
              "next": "met"
            },
            {
              "label": "少し、近いと思う",
              "next": "close"
            }
          ],
          "art": "dark-tease"
        }
      ]
    },
    "thanks": {
      "title": "小さなおしゃべり",
      "steps": [
        {
          "type": "line",
          "speaker": "ノア",
          "text": "……僕に、ありがとう？",
          "art": "warm-wake"
        },
        {
          "type": "line",
          "speaker": "ノア",
          "text": "あはは！　うん、いいよ！\nもう一回言ってくれても！",
          "art": "warm-laugh"
        },
        {
          "type": "line",
          "speaker": "",
          "text": "ノアは器を机の奥へ寄せた。\nとても気に入った言葉を聞いたような顔をしている。",
          "art": "warm-chat"
        },
        {
          "type": "line",
          "speaker": "ノア",
          "text": "じゃあ、元気になったら僕に付き合ってね。\n約束！",
          "art": "warm-proud"
        }
      ],
      "next": "outside_talk"
    },
    "met": {
      "title": "小さなおしゃべり",
      "steps": [
        {
          "type": "line",
          "speaker": "ノア",
          "text": "そう思う？",
          "art": "warm-chat"
        },
        {
          "type": "line",
          "speaker": "",
          "text": "答えるより先に、ノアが少し身を乗り出した。",
          "art": "dark-tease"
        },
        {
          "type": "line",
          "speaker": "ノア",
          "text": "どのへんが？　顔？　声？\nねえ、教えて。僕、そういうの気になる！",
          "art": "dark-tease"
        },
        {
          "type": "line",
          "speaker": "",
          "text": "思い当たるものを探しても、何も掴めない。",
          "art": "warm-wake"
        },
        {
          "type": "line",
          "speaker": "ノア",
          "text": "そっかあ。\nでも、いま会えたね。よろしく、{call}！",
          "art": "warm-laugh"
        }
      ],
      "next": "outside_talk"
    },
    "close": {
      "title": "小さなおしゃべり",
      "steps": [
        {
          "type": "line",
          "speaker": "ノア",
          "text": "ええ、そう？\n僕はこれくらいが好きなんだけど。",
          "art": "dark-tease"
        },
        {
          "type": "line",
          "speaker": "",
          "text": "ノアは椅子を、ほんの少しだけ後ろへずらす。",
          "art": "warm-chat",
          "sfx": "chair"
        },
        {
          "type": "line",
          "speaker": "ノア",
          "text": "これでどう？\nちゃんと顔が見える。うん、これでもいいや！",
          "art": "warm-laugh"
        }
      ],
      "next": "outside_talk"
    },
    "outside_talk": {
      "title": "窓の向こう",
      "steps": [
        {
          "type": "line",
          "speaker": "",
          "text": "高窓の明かりが、少しだけ傾いている。\n遠くで、鳥のようなものが一度鳴いた。",
          "art": "room",
          "sfx": "bird"
        },
        {
          "type": "line",
          "speaker": "ノア",
          "text": "外、気になる？",
          "art": "warm-chat"
        },
        {
          "type": "line",
          "speaker": "ノア",
          "text": "僕、物心ついたときからずっとここにいるから、\n外の世界はよく知らないんだ。",
          "art": "warm-chat"
        },
        {
          "type": "line",
          "speaker": "ノア",
          "text": "本では読んだよ。\n海って、向こうの端が見えないんでしょ？",
          "art": "warm-proud"
        },
        {
          "type": "line",
          "speaker": "ノア",
          "text": "水がそんなにいっぱいあったら、\nこぼれたりしないのかなあ。",
          "art": "warm-laugh"
        },
        {
          "type": "choice",
          "text": "ノアが、不思議そうに首を傾げる。",
          "options": [
            {
              "label": "海を、見てみたい？",
              "next": "sea"
            },
            {
              "label": "ここから出たいとは、思わない？",
              "next": "leave_talk"
            }
          ],
          "art": "warm-chat"
        }
      ]
    },
    "sea": {
      "title": "窓の向こう",
      "steps": [
        {
          "type": "line",
          "speaker": "ノア",
          "text": "うん！　でも、ひとりじゃつまらなそう。\n兄さまが一緒なら、見てみたい！",
          "art": "warm-proud"
        },
        {
          "type": "line",
          "speaker": "ノア",
          "text": "{call}は見たことある？\n……そっか。そういうのも、忘れちゃったんだね。",
          "art": "warm-wake"
        },
        {
          "type": "line",
          "speaker": "ノア",
          "text": "じゃあ、思い出したら教えて！\n約束、もうひとつ増えちゃったね。",
          "art": "warm-laugh"
        }
      ],
      "next": "dog"
    },
    "leave_talk": {
      "title": "窓の向こう",
      "steps": [
        {
          "type": "line",
          "speaker": "ノア",
          "text": "んー。兄さま、ここにいるし。",
          "art": "warm-chat"
        },
        {
          "type": "line",
          "speaker": "ノア",
          "text": "それに、いろんな人が来るんだよ！\n僕が外へ行かなくても、お話ができるの。",
          "art": "warm-proud"
        },
        {
          "type": "line",
          "speaker": "ノア",
          "text": "今日は、{call}がいるでしょ。\nだから、退屈してないよ！",
          "art": "dark-tease"
        }
      ],
      "next": "dog"
    },
    "dog": {
      "title": "窓の向こう",
      "steps": [
        {
          "type": "line",
          "speaker": "",
          "text": "高窓の向こうで、犬が短く吠えた。",
          "art": "room",
          "sfx": "distant"
        },
        {
          "type": "line",
          "speaker": "",
          "text": "ノアの指が、胸元の十字架をつまむ。\n笑みはそのままで、目だけが窓へ向いた。",
          "art": "warm-chat"
        },
        {
          "type": "line",
          "speaker": "ノア",
          "text": "{call}、犬は好き？",
          "art": "warm-chat"
        },
        {
          "type": "line",
          "speaker": "ノア",
          "text": "僕は嫌い。\n大事なものを取られた気がするから。",
          "art": "dark-bored"
        },
        {
          "type": "choice",
          "text": "彼の指先で、銀色が揺れる。",
          "options": [
            {
              "label": "大事なものって？",
              "next": "important"
            },
            {
              "label": "ノアの顔を、黙って見つめる",
              "next": "dog_silence"
            }
          ],
          "art": "dark-bored"
        }
      ]
    },
    "important": {
      "title": "窓の向こう",
      "steps": [
        {
          "type": "line",
          "speaker": "ノア",
          "text": "何だと思う？",
          "art": "dark-tease"
        },
        {
          "type": "line",
          "speaker": "",
          "text": "答えを待つ間、ノアの指は十字架から離れない。",
          "art": "dark-tease"
        },
        {
          "type": "line",
          "speaker": "ノア",
          "text": "ふふ、内緒！\n{call}ばっかり質問するの、ずるいよ。",
          "art": "warm-laugh"
        },
        {
          "type": "line",
          "speaker": "ノア",
          "text": "今度は僕の番ね。",
          "art": "warm-chat"
        }
      ],
      "next": "searching_echo"
    },
    "dog_silence": {
      "title": "窓の向こう",
      "steps": [
        {
          "type": "line",
          "speaker": "ノア",
          "text": "……何？\nそんな顔しなくていいよ！",
          "art": "warm-laugh"
        },
        {
          "type": "line",
          "speaker": "ノア",
          "text": "犬の話は、おしまい。\nもっと楽しい話しよっか！",
          "art": "warm-chat"
        }
      ],
      "next": "searching_echo"
    },
    "brother": {
      "title": "大好きなひと",
      "steps": [
        {
          "type": "line",
          "speaker": "ノア",
          "text": "兄さまの話、聞く？\n兄さまはすごいんだよ！",
          "art": "warm-proud"
        },
        {
          "type": "line",
          "speaker": "ノア",
          "text": "字もきれいだし、何でもよく覚えてるし。\n黙ってる人も、最後にはちゃんとお話しするの！",
          "art": "warm-proud"
        },
        {
          "type": "line",
          "speaker": "",
          "text": "まるで手品の話をするように、ノアは胸を張る。",
          "art": "warm-proud"
        },
        {
          "type": "line",
          "speaker": "ノア",
          "text": "僕、隣で見てるの好きなんだ。\n同じことを言ってるのに、顔が変わっていくから。",
          "art": "dark-tease"
        },
        {
          "type": "line",
          "speaker": "ノア",
          "text": "兄さまはね、力加減がすっごく上手なの！\n壊れそうなところで、ちゃんと止められるんだよ。",
          "art": "warm-proud"
        },
        {
          "type": "line",
          "speaker": "ノア",
          "text": "僕は下手。もうちょっとって思うと、\nすぐ壊れちゃうんだ。まだ遊びたかったのに！",
          "art": "warm-laugh"
        },
        {
          "type": "line",
          "speaker": "",
          "text": "残念そうな言葉に、残念そうな顔は伴わない。\n何を壊したのか、聞くタイミングを失った。",
          "art": "warm-chat"
        },
        {
          "type": "line",
          "speaker": "ノア",
          "text": "今日は僕に任せてくれたんだよ！\nだから、うまくできたら褒めてもらえるかな。",
          "art": "warm-laugh"
        },
        {
          "type": "line",
          "speaker": "",
          "text": "青年が机に肘をついた。\n袖口がずれ、金属が小さく触れ合う音がした。",
          "art": "warm-chat",
          "sfx": "metal"
        },
        {
          "type": "line",
          "speaker": "",
          "text": "息が、ひとつ遅れた。\nその音にも、覚えがある。",
          "art": "warm-chat",
          "effect": "pulse"
        },
        {
          "type": "choice",
          "text": "音の向こうに、何かがある。",
          "options": [
            {
              "label": "目を閉じて、音の続きを探す",
              "next": "metal_memory",
              "score": 1,
              "clue": "metal"
            },
            {
              "label": "あの人の話を、もっと聞く",
              "next": "brother_more"
            }
          ],
          "art": "warm-chat"
        }
      ]
    },
    "metal_memory": {
      "title": "ほどけるもの",
      "steps": [
        {
          "type": "line",
          "speaker": "",
          "text": "金属が鳴る。\n椅子の肘掛けに、黒い手袋が重なる。",
          "art": "memory-brother",
          "effect": "memory",
          "sfx": "metal",
          "fragment": true
        },
        {
          "type": "line",
          "speaker": "",
          "text": "立とうとした。\n手首と足首に、動けない理由だけがある。",
          "art": "memory-brother",
          "fragment": true
        },
        {
          "type": "line",
          "speaker": "",
          "text": "顎の下に、冷たい革が触れる。\n顔を背ける前に、長い髪が視界へ落ちた。",
          "art": "memory-approach",
          "effect": "memory",
          "fragment": true
        },
        {
          "type": "line",
          "speaker": "記憶の中の声",
          "text": "こちらを見なさい。\nまだ、終わっていませんよ。",
          "art": "memory-whisper",
          "memoryVoice": true,
          "fragment": true
        },
        {
          "type": "line",
          "speaker": "",
          "text": "逃げようとするたび、同じ距離へ戻される。\n声は静かなままだった。",
          "art": "memory-whisper",
          "fragment": true
        },
        {
          "type": "line",
          "speaker": "",
          "text": "口を開いた。何かを答えようとした。\nけれど、その言葉だけが戻ってこない。",
          "art": "black",
          "effect": "blackout",
          "fragment": true
        },
        {
          "type": "line",
          "speaker": "ノア",
          "text": "……おかえり！",
          "art": "warm-wake"
        },
        {
          "type": "line",
          "speaker": "",
          "text": "目を開けると、ノアがすぐ近くにいた。",
          "art": "warm-wake"
        },
        {
          "type": "line",
          "speaker": "ノア",
          "text": "聞こえてた？　さっきから呼んでたんだよ。\nね、何が見えた？",
          "art": "dark-tease"
        },
        {
          "type": "line",
          "speaker": "ノア",
          "text": "今は言えない？\nうん、いいよ。あとで、ちゃんと聞くから！",
          "art": "warm-laugh"
        }
      ],
      "next": "little_game"
    },
    "brother_more": {
      "title": "ほどけるもの",
      "steps": [
        {
          "type": "line",
          "speaker": "ノア",
          "text": "聞きたい？　いいよ！",
          "art": "warm-proud"
        },
        {
          "type": "line",
          "speaker": "ノア",
          "text": "兄さまの手袋って、いつもきれいなんだ。\nどれだけお仕置きしても、指先までぴったりで！",
          "art": "warm-proud"
        },
        {
          "type": "line",
          "speaker": "ノア",
          "text": "あの手で頭を撫でてもらうとね、\nちゃんとできたんだって分かるの。",
          "art": "warm-chat"
        },
        {
          "type": "line",
          "speaker": "",
          "text": "先ほどの金属音は、もう聞こえない。\n話を追っているうちに、胸のざわつきも薄れていく。",
          "art": "warm-chat"
        }
      ],
      "next": "little_game"
    },
    "little_game": {
      "title": "ほどけるもの",
      "steps": [
        {
          "type": "line",
          "speaker": "ノア",
          "text": "ねえ、ちょっとお遊戯しよっか！\n難しくないよ。僕の質問に答えるだけ。",
          "art": "warm-laugh"
        },
        {
          "type": "line",
          "speaker": "ノア",
          "text": "間違えたら、お仕置き！\n……なんてね。まだ何もしないよ。今は！",
          "art": "dark-tease"
        },
        {
          "type": "line",
          "speaker": "ノア",
          "text": "壊しがいのあるオモチャって、\nどんなものだと思う？",
          "art": "warm-laugh"
        },
        {
          "type": "choice",
          "text": "ノアは、あなたの目を見ている。",
          "options": [
            {
              "label": "丈夫なもの？",
              "next": "cannot_count"
            },
            {
              "label": "どうして、壊したいの？",
              "next": "why_count"
            }
          ],
          "art": "dark-tease"
        }
      ]
    },
    "cannot_count": {
      "title": "ほどけるもの",
      "steps": [
        {
          "type": "line",
          "speaker": "ノア",
          "text": "そう！　でも、硬いだけじゃつまんない。\nちゃんと返事してくれるのがいいな！",
          "art": "warm-laugh"
        },
        {
          "type": "line",
          "speaker": "ノア",
          "text": "ひとつ奪っても、まだ大丈夫って顔をするの。\n次は何を取ったら、違う顔になるんだろうね！",
          "art": "dark-tease"
        },
        {
          "type": "line",
          "speaker": "ノア",
          "text": "僕、そういうのを探してるんだ。\nなかなか壊れない、壊しがいのあるもの！",
          "art": "noah-fixation"
        },
        {
          "type": "line",
          "speaker": "",
          "text": "「もの」と呼ぶたびに、ノアの視線が近づく。\n話題がどこに向いているのか、分かりたくなかった。",
          "art": "noah-fixation"
        }
      ],
      "next": "corridor_visitors"
    },
    "why_count": {
      "title": "ほどけるもの",
      "steps": [
        {
          "type": "line",
          "speaker": "ノア",
          "text": "だって、壊れる直前だけ、\nぜんぜん違う顔をしてくれるんだもん！",
          "art": "warm-laugh"
        },
        {
          "type": "line",
          "speaker": "ノア",
          "text": "ずっと隠してたものを見せてくれるの。\nそれって、すっごく仲良しになれたってことでしょ？",
          "art": "dark-tease"
        },
        {
          "type": "line",
          "speaker": "",
          "text": "悪びれた様子も、同意を待つ間もない。\n彼の中では、もう答えが出ている。",
          "art": "warm-chat"
        },
        {
          "type": "line",
          "speaker": "ノア",
          "text": "今度こそ、長く遊べるのがいいな！\nねえ、{call}はどうかな？",
          "art": "noah-fixation"
        }
      ],
      "next": "corridor_visitors"
    },
    "window_memory_choice": {
      "title": "ほどけるもの",
      "steps": [
        {
          "type": "line",
          "speaker": "",
          "text": "高窓の光が、机の角に重なる。\n知っている。あの欠けた角を、ずっと見ていた。",
          "art": "room",
          "effect": "pulse"
        },
        {
          "type": "line",
          "speaker": "ノア",
          "text": "また、どこかへ行っちゃう？\n僕はここにいるよ、{call}。",
          "art": "warm-wake"
        },
        {
          "type": "choice",
          "text": "光の落ちる位置を――",
          "options": [
            {
              "label": "覚えている景色と、重ねてみる",
              "next": "window_recall",
              "score": 1,
              "clue": "window"
            },
            {
              "label": "目をそらして、ノアの声を聞く",
              "next": "window_avoid"
            }
          ],
          "art": "warm-wake"
        }
      ]
    },
    "window_recall": {
      "title": "ほどけるもの",
      "steps": [
        {
          "type": "line",
          "speaker": "",
          "text": "同じ窓。同じ光。\nあのとき、向かいに座っていたのは――",
          "art": "room",
          "effect": "memory"
        },
        {
          "type": "line",
          "speaker": "",
          "text": "目の前で、黒い指が動く。\nその指だけを見るように言われた。",
          "art": "memory-brother",
          "fragment": true,
          "sfx": "metal"
        },
        {
          "type": "line",
          "speaker": "",
          "text": "白いシャツではなかった。\n顔を近づけるその人を、押し返すこともできなかった。",
          "art": "memory-approach",
          "fragment": true
        },
        {
          "type": "line",
          "speaker": "記憶の中の声",
          "text": "目を逸らしても、ここからは出られません。",
          "art": "memory-whisper",
          "memoryVoice": true,
          "fragment": true
        },
        {
          "type": "line",
          "speaker": "ノア",
          "text": "あ、いま。\nちょっと、いい顔したね！",
          "art": "dark-tease"
        },
        {
          "type": "line",
          "speaker": "ノア",
          "text": "そのままでいいよ。\n続けて、続けて！",
          "art": "warm-laugh"
        }
      ],
      "next": "last_wait"
    },
    "window_avoid": {
      "title": "ほどけるもの",
      "steps": [
        {
          "type": "line",
          "speaker": "ノア",
          "text": "うん。僕のほうを見て。\nそう、そのまま！",
          "art": "warm-wake"
        },
        {
          "type": "line",
          "speaker": "",
          "text": "琥珀色の目に、自分の輪郭が小さく映っている。\n光の線も机の角も、その後ろへ沈んでいった。",
          "art": "dark-tease"
        },
        {
          "type": "line",
          "speaker": "ノア",
          "text": "……僕の顔は、よく覚えてくれそうだね。",
          "art": "warm-chat"
        }
      ],
      "next": "last_wait"
    },
    "last_wait": {
      "title": "もうすこし",
      "steps": [
        {
          "type": "line",
          "speaker": "",
          "text": "遠くで、扉の閉まる音がした。\nノアがそちらへ顔を向ける。",
          "art": "warm-chat",
          "sfx": "door"
        },
        {
          "type": "line",
          "speaker": "ノア",
          "text": "もう、そんな時間なんだ。\nお話してると、早いね！",
          "art": "warm-chat"
        },
        {
          "type": "line",
          "speaker": "",
          "text": "彼が椅子から立つ。\n背後に、重い扉と鉄の輪が見えた。",
          "art": "room"
        },
        {
          "type": "line",
          "speaker": "",
          "text": "ノアの指が、椅子の背を一度なぞる。\n二度目は、少し強く。木が小さく軋んだ。",
          "art": "noah-fixation",
          "sfx": "chair"
        },
        {
          "type": "line",
          "speaker": "ノア",
          "text": "待つの、上手になったと思わない？\nさっきから、ずっと我慢してるんだよ！",
          "art": "noah-fixation"
        },
        {
          "type": "line",
          "speaker": "ノア",
          "text": "どんな声になるのかなあ、とか。\nどこまでなら、僕を見てくれるのかなあ、とか！",
          "art": "noah-fixation"
        },
        {
          "type": "line",
          "speaker": "",
          "text": "笑顔のまま、息だけが少し速くなる。\nもう何を話しても、彼の期待を膨らませてしまう。",
          "art": "noah-fixation"
        },
        {
          "type": "line",
          "speaker": "ノア",
          "text": "ね、{call}。\n最後に、もう一回だけ聞くね。",
          "art": "warm-wake"
        },
        {
          "type": "line",
          "speaker": "ノア",
          "text": "ここで、何があったか。\n思い出せた？",
          "art": "warm-wake"
        }
      ],
      "next": state => state.memory >= 2 ? 'recovered' : 'forgotten'
    },
    "recovered": {
      "title": "おもいだして、ね。",
      "steps": [
        {
          "type": "line",
          "speaker": "",
          "text": "椅子が、石の床を擦る。",
          "art": "room",
          "sfx": "chair",
          "effect": "memory"
        },
        {
          "type": "line",
          "speaker": "",
          "text": "机の向こうに、黒い手袋が置かれている。\n長い髪。冷たい目。光を返す、銀の十字架。",
          "art": "memory-brother"
        },
        {
          "type": "line",
          "speaker": "",
          "text": "その目が、こちらだけを見ている。\nまばたきをしても、そこにいる。",
          "art": "memory-whisper",
          "fragment": true
        },
        {
          "type": "line",
          "speaker": "",
          "text": "顎を持ち上げられた。\n椅子に留められた身体は、わずかにも退けない。",
          "art": "memory-approach",
          "fragment": true
        },
        {
          "type": "line",
          "speaker": "",
          "text": "顔が近づく。\n声を荒らげる必要さえない距離へ。",
          "art": "memory-whisper",
          "effect": "near",
          "fragment": true
        },
        {
          "type": "line",
          "speaker": "記憶の中の声",
          "text": "大丈夫。加減は分かっています。\nあなたが答えるまでは、終わらせません。",
          "art": "memory-whisper",
          "memoryVoice": true,
          "fragment": true
        },
        {
          "type": "line",
          "speaker": "",
          "text": "何かを聞かれていた。\n答えようとするたび、言葉が途中で切れた。",
          "art": "memory-brother"
        },
        {
          "type": "line",
          "speaker": "",
          "text": "どれほど時間が過ぎたのか。\nここへ来た理由も、その人が求めた答えも、届かない。",
          "art": "memory-brother"
        },
        {
          "type": "line",
          "speaker": "",
          "text": "ただ、覚えている。\n意識が途切れる直前に聞いた、明るい声。",
          "art": "memory-brother"
        },
        {
          "type": "line",
          "speaker": "ノア",
          "text": "兄さま、もう眠っちゃったの？",
          "art": "memory-brother",
          "memoryVoice": true
        },
        {
          "type": "line",
          "speaker": "ノア",
          "text": "まだ壊れてない？　ほんと？\nじゃあ、僕にも貸して！　今度はゆっくり遊ぶから！",
          "art": "memory-brother",
          "memoryVoice": true
        },
        {
          "type": "line",
          "speaker": "ノア",
          "text": "じゃあ、起きたら僕に代わってね！",
          "art": "memory-brother",
          "memoryVoice": true
        },
        {
          "type": "line",
          "speaker": "",
          "text": "目を開ける。\n同じ窓の下で、ノアが微笑んでいる。",
          "art": "warm-wake",
          "effect": "return"
        },
        {
          "type": "line",
          "speaker": "ノア",
          "text": "おかえり、{call}。\n……どうだった？",
          "art": "dark-tease"
        },
        {
          "type": "choice",
          "text": "ノアは、あなたの返事を待っている。",
          "options": [
            {
              "label": "「思い出した」と伝える",
              "next": "ending_one"
            },
            {
              "label": "まだ何も思い出せないふりをする",
              "next": "conceal"
            }
          ],
          "art": "dark-tease"
        }
      ]
    },
    "ending_one": {
      "title": "その顔が見たかった",
      "steps": [
        {
          "type": "line",
          "speaker": "",
          "text": "声にしようとした瞬間、喉が動かなくなった。\nノアの目が、自分の顔を追っている。",
          "art": "dark-tease"
        },
        {
          "type": "line",
          "speaker": "ノア",
          "text": "……あっ、その顔！",
          "art": "dark-delight"
        },
        {
          "type": "line",
          "speaker": "ノア",
          "text": "僕、その顔が見たかったんだ！",
          "art": "dark-delight"
        },
        {
          "type": "line",
          "speaker": "",
          "text": "彼は本当に嬉しそうだった。\nさっき水をくれたときと、同じ手を伸ばしてくる。",
          "art": "dark-delight"
        },
        {
          "type": "line",
          "speaker": "ノア",
          "text": "すごいね、ちゃんと思い出せたね！\n頑張った{call}、可愛い！",
          "art": "dark-delight"
        },
        {
          "type": "line",
          "speaker": "ノア",
          "text": "帰れないって分かった顔。\n助けてくれる人なんか、ここにはいないって顔！",
          "art": "noah-fixation"
        },
        {
          "type": "line",
          "speaker": "ノア",
          "text": "ひとつずつ奪ったら、どんなふうに変わるんだろう。\nああ、もう、待てないや！",
          "art": "noah-fixation"
        },
        {
          "type": "line",
          "speaker": "",
          "text": "ノアが身を寄せる。\n白いシャツが、扉も窓も隠していく。",
          "art": "dark-delight",
          "effect": "near"
        },
        {
          "type": "line",
          "speaker": "ノア",
          "text": "でも、すぐ壊れちゃだめだよ？\nやっと、もっと遊びたいオモチャを見つけたんだから！",
          "art": "noah-fixation"
        },
        {
          "type": "line",
          "speaker": "",
          "text": "その約束だけは、こちらに任されていた。\n彼が力を緩めるつもりは、少しもない。",
          "art": "noah-fixation"
        },
        {
          "type": "line",
          "speaker": "ノア",
          "text": "これから僕と、たくさん遊ぼうね。",
          "art": "dark-delight"
        },
        {
          "type": "line",
          "speaker": "",
          "text": "遠くで鍵が鳴った。\nノアは、こちらを見たまま笑っている。",
          "art": "dark-delight",
          "sfx": "lock"
        },
        {
          "type": "end",
          "key": "one"
        }
      ]
    },
    "forgotten": {
      "title": "今度は僕の番",
      "steps": [
        {
          "type": "line",
          "speaker": "",
          "text": "探しても、何も掴めなかった。\n何かあったはずだという感覚だけが、頭の奥に残る。",
          "art": "warm-wake"
        },
        {
          "type": "line",
          "speaker": "ノア",
          "text": "……そっかあ。",
          "art": "dark-bored"
        },
        {
          "type": "line",
          "speaker": "",
          "text": "ノアは頬杖をついて、長く息を吐いた。\n椅子の下で、片足が小さく揺れる。",
          "art": "dark-bored"
        },
        {
          "type": "line",
          "speaker": "ノア",
          "text": "ほんとに、何にも？\nあんなに待ってたのに。つまんないなあ。",
          "art": "dark-bored"
        },
        {
          "type": "line",
          "speaker": "",
          "text": "ふと、彼が顔を上げた。",
          "art": "warm-proud"
        },
        {
          "type": "line",
          "speaker": "ノア",
          "text": "あ、そっか！\n思い出せないなら、新しく覚えればいいんだ！",
          "art": "warm-laugh"
        },
        {
          "type": "line",
          "speaker": "ノア",
          "text": "じゃあ今度は、兄さまに代わって僕が尋問するよ！",
          "art": "dark-delight"
        },
        {
          "type": "line",
          "speaker": "",
          "text": "尋問。\nその言葉だけが、部屋の中で形を持った。",
          "art": "room",
          "sfx": "metal"
        },
        {
          "type": "line",
          "speaker": "ノア",
          "text": "兄さまは上手だけど、\n僕は手加減できるか分からないや。",
          "art": "dark-delight"
        },
        {
          "type": "line",
          "speaker": "ノア",
          "text": "いつも途中で壊しちゃうの。\n急に返事しなくなるから、びっくりするんだよね！",
          "art": "warm-laugh"
        },
        {
          "type": "line",
          "speaker": "ノア",
          "text": "でも、今度は大丈夫かもしれない！\n{call}、兄さまのお遊戯に耐えたんだもん。",
          "art": "noah-fixation"
        },
        {
          "type": "line",
          "speaker": "",
          "text": "ノアが机の向こうへ回る。\n何かを選ぶ指先が、楽しそうに動いている。",
          "art": "room"
        },
        {
          "type": "line",
          "speaker": "ノア",
          "text": "みんないなくなる前に、見つかるといいなあ。\n……何が、だったっけ？",
          "art": "warm-chat"
        },
        {
          "type": "line",
          "speaker": "",
          "text": "独り言は、笑い声に溶けた。\n答えを知ることが、救いになる気はしなかった。",
          "art": "warm-chat"
        },
        {
          "type": "line",
          "speaker": "ノア",
          "text": "ふふ。今度は僕のこと、忘れないでね！",
          "art": "dark-delight"
        },
        {
          "type": "line",
          "speaker": "",
          "text": "椅子が、石の床を擦った。",
          "art": "dark-delight",
          "sfx": "chair"
        },
        {
          "type": "end",
          "key": "two"
        }
      ]
    },
    "conceal": {
      "title": "外の世界",
      "steps": [
        {
          "type": "line",
          "speaker": "",
          "text": "何も浮かばなかったふりをして、首を振る。\nノアは、こちらの顔をしばらく見ていた。",
          "art": "dark-tease"
        },
        {
          "type": "line",
          "speaker": "ノア",
          "text": "……ふうん。\nそうなんだ。",
          "art": "warm-chat"
        },
        {
          "type": "line",
          "speaker": "",
          "text": "外の景色を見れば、何か思い出せるかもしれない。\nそう言って、扉のほうを見る。",
          "art": "room"
        },
        {
          "type": "line",
          "speaker": "ノア",
          "text": "外に？",
          "art": "warm-wake"
        },
        {
          "type": "line",
          "speaker": "",
          "text": "ノアは瞬きをして、それからぱっと笑った。",
          "art": "warm-laugh"
        },
        {
          "type": "line",
          "speaker": "ノア",
          "text": "いいよ！　この部屋から出るだけなら。\n行っておいで！",
          "art": "warm-laugh"
        },
        {
          "type": "line",
          "speaker": "",
          "text": "彼の手の中で、鍵が回る。\n扉の向こうから、冷たい空気が流れてきた。",
          "art": "dark-door",
          "sfx": "lock"
        },
        {
          "type": "line",
          "speaker": "ノア",
          "text": "外がどんなところだったか、\nあとで僕にも教えてね！",
          "art": "dark-door"
        },
        {
          "type": "line",
          "speaker": "",
          "text": "立ち上がると、視界が揺れた。\n扉は、本当に開いている。",
          "art": "dark-door"
        },
        {
          "type": "line",
          "speaker": "ノア",
          "text": "ばいばい、可愛い{call}！",
          "art": "dark-door"
        },
        {
          "type": "line",
          "speaker": "",
          "text": "敷居を越える。\n長い回廊の先に、外へ続く白い明かりがあった。",
          "art": "corridor",
          "sfx": "steps"
        },
        {
          "type": "line",
          "speaker": "",
          "text": "一歩。もう一歩。\n背後で、別の足音が重なる。",
          "art": "corridor",
          "sfx": "steps"
        },
        {
          "type": "line",
          "speaker": "",
          "text": "振り返るより先に、誰かの手が肩に触れた。",
          "art": "corridor"
        },
        {
          "type": "line",
          "speaker": "",
          "text": "息を吸おうとして――\nできなかった。",
          "art": "black",
          "effect": "blackout",
          "sfx": "thud"
        },
        {
          "type": "line",
          "speaker": "",
          "text": "遠くで、ノアの声がした。",
          "art": "black"
        },
        {
          "type": "line",
          "speaker": "ノア",
          "text": "あれ。もう、おしまい？",
          "art": "black"
        },
        {
          "type": "line",
          "speaker": "ノア",
          "text": "僕のオモチャ、勝手に処理しないでって\n言っておいたのになあ。",
          "art": "black"
        },
        {
          "type": "line",
          "speaker": "",
          "text": "返事をする力も、光も、消えていく。\n最後まで、その人の顔は見えなかった。",
          "art": "black"
        },
        {
          "type": "end",
          "key": "three"
        }
      ]
    },
    "searching_echo": {
      "title": "窓の向こう",
      "steps": [
        {
          "type": "line",
          "speaker": "",
          "text": "話が途切れた。\nノアは十字架の鎖を指に巻いて、誰もいない隅を見ている。",
          "art": "warm-chat"
        },
        {
          "type": "line",
          "speaker": "ノア",
          "text": "……誰か、探してた気がするんだよね。",
          "art": "warm-chat"
        },
        {
          "type": "line",
          "speaker": "ノア",
          "text": "誰だったかなあ。\n顔も、名前も、出てこないや。",
          "art": "warm-chat"
        },
        {
          "type": "line",
          "speaker": "",
          "text": "こちらに尋ねているのではない。\n確かめるように、唇だけが動いていた。",
          "art": "warm-chat"
        },
        {
          "type": "line",
          "speaker": "ノア",
          "text": "でも、見つけたら分かると思う！\n……たぶんね。",
          "art": "warm-laugh"
        },
        {
          "type": "line",
          "speaker": "ノア",
          "text": "あ、そうだ！　兄さまの話、まだだったね！",
          "art": "warm-proud"
        }
      ],
      "next": "brother"
    },
    "corridor_visitors": {
      "title": "扉の外の足音",
      "steps": [
        {
          "type": "line",
          "speaker": "",
          "text": "扉を、控えめに叩く音がした。\n向こう側で誰かが息を整えている。",
          "art": "room",
          "sfx": "door"
        },
        {
          "type": "line",
          "speaker": "扉の向こうの声",
          "text": "ノア様。先ほどの異端者の、処理について……",
          "art": "room"
        },
        {
          "type": "line",
          "speaker": "ノア",
          "text": "ああ、それ！\n兄さまのところに持っていって。僕、いま忙しいから！",
          "art": "warm-laugh"
        },
        {
          "type": "line",
          "speaker": "",
          "text": "返事は短かった。\n足音は、ほとんど逃げるように遠ざかっていく。",
          "art": "room",
          "sfx": "steps"
        },
        {
          "type": "line",
          "speaker": "ノア",
          "text": "みんな、僕と二人きりになるのは嫌みたい。\n教団の神童だ、天才だって褒めるくせにね！",
          "art": "warm-proud"
        },
        {
          "type": "line",
          "speaker": "ノア",
          "text": "「この歳で、あれほどの異端者を」って。\n難しい顔して、いっつも同じこと言うんだよ！",
          "art": "warm-laugh"
        },
        {
          "type": "line",
          "speaker": "",
          "text": "話しながら、ノアが鉄の留め金に触れる。\nそれは、柔らかな枝のようにしなった。",
          "art": "warm-chat",
          "sfx": "metal"
        },
        {
          "type": "line",
          "speaker": "ノア",
          "text": "あ。またやっちゃった。\nこれだから、力加減って難しいよね！",
          "art": "warm-laugh"
        },
        {
          "type": "line",
          "speaker": "",
          "text": "白い袖口を直す仕草に、ためらいはない。\n扉の向こうの人が、怯えていた理由が分かった。",
          "art": "warm-chat"
        }
      ],
      "next": "toys_and_absences"
    },
    "toys_and_absences": {
      "title": "お片づけの話",
      "steps": [
        {
          "type": "line",
          "speaker": "ノア",
          "text": "さっきの？　お遊戯が終わったあとの話だよ！\nお片づけまでしなくちゃ、兄さまに叱られちゃう。",
          "art": "warm-proud"
        },
        {
          "type": "line",
          "speaker": "ノア",
          "text": "教団の人は「排除」とか「処理」って言うの。\n難しいよね。いなくなるだけなのに！",
          "art": "warm-chat"
        },
        {
          "type": "line",
          "speaker": "",
          "text": "隣の部屋も、その隣も、静まり返っている。\n最初から、誰もいなかったのだろうか。",
          "art": "room"
        },
        {
          "type": "line",
          "speaker": "ノア",
          "text": "前はね、もっと賑やかだったよ！\nでも、お遊戯が終わると、みんないなくなるんだ。",
          "art": "warm-laugh"
        },
        {
          "type": "line",
          "speaker": "ノア",
          "text": "……帰ったんじゃないよ。\nここに来た人は、帰れないの。",
          "art": "dark-tease"
        },
        {
          "type": "line",
          "speaker": "",
          "text": "聞き返そうとして、息だけが漏れた。\nノアは、それを笑い声と同じように楽しんでいる。",
          "art": "dark-tease"
        },
        {
          "type": "line",
          "speaker": "ノア",
          "text": "だから、急いで壊しちゃうともったいないよね！\n僕も兄さまみたいに、上手になりたいな。",
          "art": "warm-proud"
        },
        {
          "type": "line",
          "speaker": "ノア",
          "text": "……でも。あの人は、どこへ……。",
          "art": "warm-chat"
        },
        {
          "type": "line",
          "speaker": "",
          "text": "視線が、あなたを通り抜ける。\n今度は確かに、誰かを呼びかけたように聞こえた。",
          "art": "warm-chat"
        },
        {
          "type": "line",
          "speaker": "ノア",
          "text": "ん？　何でもない！\n呼びたい名前がある気がしただけ。思い出せないや。",
          "art": "warm-laugh"
        },
        {
          "type": "line",
          "speaker": "ノア",
          "text": "今は、可愛い{call}がいるもんね！",
          "art": "dark-tease"
        }
      ],
      "next": "window_memory_choice"
    }
  },
  "arts": {
    "warm-wake": {
      "title": "目をあけて",
      "file": "warm-wake.webp"
    },
    "warm-chat": {
      "title": "となりの声",
      "file": "warm-chat.webp"
    },
    "warm-laugh": {
      "title": "無邪気な笑顔",
      "file": "warm-laugh.webp"
    },
    "warm-proud": {
      "title": "大好きなひと",
      "file": "warm-proud.webp"
    },
    "dark-tease": {
      "title": "もうすこし、近く",
      "file": "dark-tease.webp"
    },
    "dark-bored": {
      "title": "待ちくたびれた頬",
      "file": "dark-bored.webp"
    },
    "dark-delight": {
      "title": "見たかったもの",
      "file": "dark-delight.webp"
    },
    "dark-door": {
      "title": "扉の向こうへ",
      "file": "dark-door.webp"
    },
    "memory-brother": {
      "title": "途切れる前に",
      "file": "memory-brother.webp"
    },
    "room": {
      "title": "高窓のある部屋",
      "file": "room.webp",
      "background": true
    },
    "corridor": {
      "title": "長い回廊",
      "file": "corridor.webp",
      "background": true
    },
    "chamber": {
      "title": "光の届く底",
      "file": "chamber.webp",
      "background": true
    },
    "memory-approach": {
      "title": "逃がさない距離",
      "file": "memory-approach-v2.webp"
    },
    "memory-whisper": {
      "title": "耳元に残る声",
      "file": "memory-whisper-v2.webp"
    },
    "noah-fixation": {
      "title": "まだ、壊れないで",
      "file": "noah-fixation-v2.webp"
    }
  },
  "endings": {
    "one": {
      "number": "I",
      "title": "その顔が見たかった",
      "art": "dark-delight",
      "line": "すべて思い出した。\nノアは、心から嬉しそうだった。"
    },
    "two": {
      "number": "II",
      "title": "今度は僕の番",
      "art": "dark-bored",
      "line": "記憶は戻らなかった。\n新しいお遊戯が、始まる。"
    },
    "three": {
      "number": "III",
      "title": "外の世界",
      "art": "dark-door",
      "line": "扉は、開いていた。\nその先の光には、届かなかった。"
    }
  },
  "revision": 4,
  "updatedScenes": [
    "important",
    "dog_silence",
    "brother",
    "metal_memory",
    "brother_more",
    "little_game",
    "cannot_count",
    "why_count",
    "window_recall",
    "last_wait",
    "recovered",
    "ending_one",
    "forgotten",
    "conceal"
  ]
};

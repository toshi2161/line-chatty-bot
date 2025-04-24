const express = require('express');
const line = require('@line/bot-sdk');
const app = express();

const config = {
  channelAccessToken: 'yVsePczCBmahynv36hl7Oc8wN8zmoiKzk3EA8Mn+EVzNxlBjI8KgyXkBluGCBx3zBt0OpkjbX3d+Tls+RhlzrLgzSIgtwpMCf/MFtgMuLbLSDeC6mSEZp1rGBR4p92fXt7oCUpJ6PKF3Bp1F4xoonAdB04t89/1O/w1cDnyilFU=',
  channelSecret: '2fc42cec5021424b064ac0c6a4136c10'
};

const client = new line.Client(config);

app.post('/webhook', line.middleware(config), (req, res) => {
  Promise.all(req.body.events.map(handleEvent))
    .then(result => res.json(result))
    .catch(err => {
      console.error('Error:', err);
      res.status(500).end();
    });
});

async function handleEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'text') return null;

  const msg = event.message.text.trim();
  const replyToken = event.replyToken;

  if (msg.includes('こんにちは') || msg.includes('旅')) {
    return client.replyMessage(replyToken, {
      type: 'text',
      text:
        'ようこそ、TOSHI EXPOへ。\n今の気分に近いものを選んでください：\n\n① のんびり休みたい\n② 自分を表現したい\n③ 子どもの頃を思い出したい\n④ 自分を見つめ直したい'
    });
  }

  const routes = {
    '1': [
      '▶︎ ねころびの森\n草の上に寝転んだら、空の音が聞こえた。\n風がやさしく吹いて、「そのままでいいよ」と葉が囁く。\nまぶたの裏に、ゆっくりとやすらぎが広がっていく。',
      '▶︎ ゆのくに銀河温泉\n湯けむりの向こうで、星が瞬いている。\n湯に浸かれば、今日の疲れが静かにほどけていく。\nぽちゃんという音と一緒に、心がやわらかくなっていく。',
      '▶︎ いつでも帰れる場所\n縁側に座って、夕焼けをぼんやり見ていた。\nあの頃と同じ匂いがして、胸の奥がふっとあたたかくなる。\nどこにいても、ここに戻ってこられる気がした。',
      'Opus：「休むことは、生きることだよ。」'
    ],
    '2': [
      '▶︎ 奏でよ、自分の心\n手をかざすと、目の前に音が浮かんだ。\n感情をそのまま音に変えたら、誰かがそっとうなずいてくれた。\n「これでいいんだ」って、胸の奥がじんわり響いた。',
      '▶︎ こころが交差する場所\n宙に浮かぶ言葉に触れたとき、誰かの気持ちとすれ違った。\nまるで自分の感情みたいに、やさしく受け取ってくれた。\n言葉って、出すものじゃなくて“重なるもの”なんだと気づいた。',
      '▶︎ トシノキ 想像力の図書館\nふと手にした葉っぱの本には、見たことのない自分がいた。\n小さなころから心の奥で描いてた世界が、そこに生きていた。\nああ、これが「好き」ってことだったんだ。',
      'Opus：「あなたの声は、世界に届いてる。」'
    ],
    '3': [
      '▶︎ トシノキ 想像力の図書館\n葉のあいだから差し込む光に照らされて、\n昔描いた空想の世界が、静かにページをめくっていた。\n「なんでこんなこと描いてたんだろう」って、ちょっと照れながら誇らしくなった。',
      '▶︎ きみと、写真を撮りたくて\nあのとき撮った一枚の写真。\n少しブレてるけど、楽しそうな笑い声が聞こえてきそうだった。\n「残したい」って気持ちが、未来の自分に届いていたんだ。',
      '▶︎ いつでも帰れる場所\n押し入れの奥から出てきた、クレヨンの匂い。\n懐かしいのに、今の自分にちゃんとつながってる気がした。\nただいま、って言える場所が心の中にあった。',
      'Opus：「あなたの“好き”は、まだ生きている。」'
    ],
    '4': [
      '▶︎ こころが交差する場所\n夜の森のなかに浮かぶ、いくつもの言葉たち。\n誰かの気持ちと、自分の想いが重なるのを感じた。\n「わたし」って、誰かとの間に生まれるものなんだと気づいた。',
      '▶︎ ゆのくに銀河温泉\n星を見上げながら、湯けむりの中で深呼吸した。\n静かにあたたまるたびに、焦りやざわつきが遠のいていく。\nほんとうの自分は、何も足さずにここにいた。',
      '▶︎ トシノキ 想像力の図書館\n気づかないふりをしていた感情が、1枚の葉っぱに書かれていた。\n拾いあげたとき、なぜか少し泣きたくなった。\nでも、それでよかった。「自分のこと」を、大切にできた気がした。',
      'Opus：「見つめた分だけ、優しくなれる。」'
    ]
  };

  const key = msg.replace(/[^1-4]/g, ''); // ①～④の数字だけ抜き出す

  if (routes[key]) {
    const messages = routes[key].map(text => ({ type: 'text', text }));
    return client.replyMessage(replyToken, messages);
  }

  return client.replyMessage(replyToken, {
    type: 'text',
    text: '「こんにちは」または「旅に出たい」と話しかけてみてね！'
  });
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`TOSHI EXPO LINE Bot is running on port ${PORT}`);
});

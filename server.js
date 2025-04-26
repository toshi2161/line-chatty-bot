require('dotenv').config();  // ← ここ追加！

const express = require('express');
const line = require('@line/bot-sdk');
const axios = require('axios');
const app = express();

const config = {
  channelAccessToken: process.env.LINE_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET
};

const client = new line.Client(config);

const userMode = {}; // userId: 'travel' or 'opus'

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

  const userId = event.source.userId;
  const msg = event.message.text.trim();
  const replyToken = event.replyToken;

  if (msg === '/旅') {
    userMode[userId] = 'travel';
    return client.replyMessage(replyToken, {
      type: 'text',
      text: 'Opus：「ようこそ、旅人さん。」\n\n今の気分に近いものを選んでください：\n① のんびり休みたい\n② 自分を表現したい\n③ 子どもの頃を思い出したい\n④ 自分を見つめ直したい'
    });
  }

  if (msg === '/Opus') {
    userMode[userId] = 'opus';
    return client.replyMessage(replyToken, {
      type: 'text',
      text: 'Opus：「どんなことでも、君の言葉を聞かせて。」'
    });
  }

  if (msg === '/終了') {
    delete userMode[userId];
    return client.replyMessage(replyToken, {
      type: 'text',
      text: 'Opus：「また旅に出たくなったら、いつでも声をかけてね。」'
    });
  }

  const mode = userMode[userId];

  if (mode === 'travel') {
    return handleTravelMode(msg, replyToken);
  } else if (mode === 'opus') {
    return handleOpusTalk(msg, replyToken);
  } else {
    return client.replyMessage(replyToken, {
      type: 'text',
      text: 'Opus：「/旅 か /Opus と送って、冒険を始めよう。」'
    });
  }
}

async function handleTravelMode(msg, replyToken) {
  const keyMap = {
    '1': '1', '①': '1',
    '2': '2', '②': '2',
    '3': '3', '③': '3',
    '4': '4', '④': '4'
  };
  const key = keyMap[msg];

  const routes = {
    '1': ['▶︎ ねころびの森\n草の上に寝転び、空を眺める旅が始まる。'],
    '2': ['▶︎ 奏でよ、自分の心\n音に気持ちを乗せる旅が始まる。'],
    '3': ['▶︎ トシノキ 想像力の図書館\n昔描いた空想を手に取る旅が始まる。'],
    '4': ['▶︎ こころが交差する場所\n言葉と感情が重なる旅が始まる。']
  };

  if (routes[key]) {
    const messages = routes[key].map(text => ({ type: 'text', text }));
    return client.replyMessage(replyToken, messages);
  }

  return client.replyMessage(replyToken, {
    type: 'text',
    text: 'Opus：「①〜④から選んでね。」'
  });
}

async function handleOpusTalk(msg, replyToken) {
  try {
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'あなたはTOSHI EXPOの案内役「Opus」です。やさしく詩的に話してください。' },
        { role: 'user', content: msg }
      ],
      max_tokens: 250,
      temperature: 0.85
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      }
    });

    const opusReply = response.data.choices[0].message.content.trim();
    return client.replyMessage(replyToken, { type: 'text', text: `Opus：${opusReply}` });
  } catch (err) {
    console.error('Opus会話エラー:', err.message);
    return client.replyMessage(replyToken, {
      type: 'text',
      text: 'Opus：「うまく言葉が見つからなかったみたい。」'
    });
  }
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`TOSHI EXPO LINE Bot is running on port ${PORT}`);
});
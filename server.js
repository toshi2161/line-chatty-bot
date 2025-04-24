const express = require('express');
const line = require('@line/bot-sdk');

const config = {
  channelAccessToken: 'yVsePczCBmahynv36hl7Oc8wN8zmoiKzk3EA8Mn+EVzNxlBjI8KgyXkBluGCBx3zBt0OpkjbX3d+Tls+RhlzrLgzSIgtwpMCf/MFtgMuLbLSDeC6mSEZp1rGBR4p92fXt7oCUpJ6PKF3Bp1F4xoonAdB04t89/1O/w1cDnyilFU=',
  channelSecret: '2fc42cec5021424b064ac0c6a4136c10'
};

const app = express();
app.use(express.json());

app.post('/callback', line.middleware(config), (req, res) => {
  console.log('受信イベント:', req.body.events);

  Promise
    .all(req.body.events.map(handleEvent))
    .then(() => res.send('ok'))
    .catch((err) => {
      console.error(err);
      res.status(500).end();
    });
});

const client = new line.Client(config);

function handleEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'text') {
    return Promise.resolve(null);
  }

  return client.replyMessage(event.replyToken, {
    type: 'text',
    text: `チャッティー応答：『${event.message.text}』受け取ったで！`
  });
}

app.listen(process.env.PORT || 3000, () => {
  console.log('LINE BOT起動中！');
});

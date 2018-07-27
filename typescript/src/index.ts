import * as express from 'express';
import * as bodyParser from 'body-parser';
import axios from 'axios';
const app = express().use(bodyParser.json());

interface ID {
  id: string;
}

interface Message {
  mid: string;
  seq: number;
  text: string;
}

interface Messaging {
  sender: ID;
  recipient: ID;
  timestamp: number;
  message: Message;
}

interface MessageText {
  text: string;
}

interface SendMessageText {
  recipient: ID;
  message: MessageText;
}

const sendText = async (id, text) => {
  const sendMessageText: SendMessageText = {
    recipient: { id },
    message: { text },
  };

  const resp = await axios.post(
    `https://graph.facebook.com/v2.6/me/messages?access_token=${
      process.env.MESSENGER_ACCESS_TOKEN
    }`,
    sendMessageText,
  );

  return resp.data;
};

app.post('/webhook', (req, res) => {
  req.body.entry.forEach(async entry => {
    try {
      // Messaging is only ever one so just grab first
      const webhook_event: Messaging = entry.messaging[0];

      if (webhook_event.message) {
        await sendText(
          webhook_event.sender.id,
          `TypeScript Echo: ${webhook_event.message.text}`,
        );
      }
      return res.status(200).send('EVENT_RECEIVED');
    } catch (e) {
      console.error('error!', e);
      return res.sendStatus(500);
    }
  });
});

app.get('/webhook', (req, res) => {
  if (req.query['hub.verify_token'] === 'dfischer') {
    res.status(200).send(req.query['hub.challenge']);
  } else {
    res.sendStatus(403);
  }
});

app.listen(process.env.PORT || 1337, () => console.log('webhook is listening'));

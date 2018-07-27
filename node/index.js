const express = require('express'),
  bodyParser = require('body-parser'),
  app = express().use(bodyParser.json()); // creates express http server

const request = require('request');

function sendMessageText(sender_psid, response) {
  const request_body = {
    recipient: {
      id: sender_psid,
    },
    message: response,
  };

  request(
    {
      uri: `https://graph.facebook.com/v2.6/me/messages?access_token=${
        process.env.MESSENGER_ACCESS_TOKEN
      }`,
      method: 'POST',
      json: request_body,
    },
    (err, res, body) => {
      if (!err) {
        console.log('message sent!');
      } else {
        console.error('Unable to send message:' + err);
      }
    },
  );
}

app.post('/webhook', (req, res) => {
  req.body.entry.forEach(function(entry) {
    // Messaging is only ever one so just grab first
    const webhook_event = entry.messaging[0];

    if (webhook_event.message) {
      sendMessageText(webhook_event.sender.id, {
        text: `Node Echo: ${webhook_event.message.text}`,
      });
    }
  });

  res.status(200).send('EVENT_RECEIVED');
});

app.get('/webhook', (req, res) => {
  if (req.query['hub.verify_token'] === 'dfischer') {
    res.status(200).send(req.query['hub.challenge']);
  } else {
    res.sendStatus(403);
  }
});

app.listen(process.env.PORT || 1337, () => console.log('webhook is listening'));

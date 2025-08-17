const express = require('express');
const twilio = require('twilio');
const { generateReply } = require('../services/aiProvider');
const { makeTwilioClients } = require('../services/twilio');
const state = require('../services/state');

const router = express.Router();

// Handle incoming messages from Twilio Conversations
router.post('/conversations', async (req, res, next) => {
  const { ConversationSid, Body, Author, From } = req.body;

  try {
    // avoid responding to our own messages
    if (!Body || Author === 'bot') {
      return res.sendStatus(200);
    }

    // generate AI reply and send back via Twilio Conversations
    const reply = await generateReply({
      tenant: req.tenant,
      userMsg: Body,
      fromPhone: From,
    });

    if (reply) {
      const { conversations } = makeTwilioClients(req.tenant);
      await conversations.v1
        .conversations(ConversationSid)
        .messages.create({ author: 'bot', body: reply });
    }

    // store latest state
    await state.upsert(ConversationSid, { lastInbound: Body });

    res.sendStatus(200);
  } catch (err) {
    next(err);
  }
});

// Simple voice webhook returning basic TwiML
router.post('/voice', (req, res) => {
  const response = new twilio.twiml.VoiceResponse();
  response.say('Thank you for calling. Please hold while we connect you.');
  res.type('text/xml');
  res.send(response.toString());
});

module.exports = router;

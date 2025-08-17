const express = require('express');
const twilio = require('twilio');
const { generateReply } = require('../services/aiProvider');
const { makeTwilioClients } = require('../services/twilio');
const state = require('../services/state');

const router = express.Router();

/**
 * Webhook de Conversations (WhatsApp/SMS/Webchat)
 * Procesa sólo onMessageAdded, ignora mensajes del bot y responde con IA si procede.
 */
router.post('/conversations', async (req, res, next) => {
  const { ConversationSid, Body, Author, From, EventType } = req.body;

  try {
    // Procesar sólo mensajes entrantes reales
    if (EventType && EventType !== 'onMessageAdded') {
      await state.upsert(ConversationSid, { lastEvent: EventType });
      return res.sendStatus(200);
    }

    // Evitar loops (nuestros propios mensajes)
    if (!Body || Author === 'bot') {
      return res.sendStatus(200);
    }

    // Generar respuesta IA
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

    // Guardar último estado básico
    await state.upsert(ConversationSid, {
      lastInbound: Body,
      lastAuthor: Author,
      lastEvent: 'onMessageAdded',
      updatedBy: 'webhook.conversations',
    });

    res.sendStatus(200);
  } catch (err) {
    next(err);
  }
});

/**
 * Webhook de Voice (Studio/IVR → TwiML simple)
 */
router.post('/voice', (req, res) => {
  const response = new twilio.twiml.VoiceResponse();
  response.say('Thank you for calling. Please hold while we connect you.');
  res.type('text/xml');
  res.send(response.toString());
});

module.exports = router;

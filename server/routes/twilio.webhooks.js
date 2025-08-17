import express from 'express';
import twilio from 'twilio';
import { generateReply } from '../services/aiProvider.js';
import { makeTwilioClients } from '../services/twilio.js';
import * as state from '../services/state.js';

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

    const { conversations } = makeTwilioClients(req.tenant);
    const convo = await conversations.v1.conversations(ConversationSid).fetch();
    const attrs = convo.attributes ? JSON.parse(convo.attributes) : {};
    const aiEnabled = attrs.aiEnabled !== false;

    const { reply, handoff } = await generateReply({
      tenant: req.tenant,
      userMsg: Body,
      fromPhone: From,
      conversationId: ConversationSid,
      aiEnabled,
    });

    if (handoff) {
      attrs.aiEnabled = false;
      await conversations.v1
        .conversations(ConversationSid)
        .update({ attributes: JSON.stringify(attrs) });
    } else if (reply) {
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

export default router;

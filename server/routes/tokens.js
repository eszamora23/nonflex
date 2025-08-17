const express = require('express');
const twilio = require('twilio');
const audit = require('../services/audit');

const router = express.Router();

router.post('/', async (req, res, next) => {
  const { identity, room, serviceSid } = req.body;
  try {
    const { accountSid, apiKey, apiSecret, conversationsServiceSid } = req.tenant?.twilio || {};

    if (!identity || !accountSid || !apiKey || !apiSecret) {
      return res.status(400).json({ error: 'Missing credentials or identity' });
    }

    const AccessToken = twilio.jwt.AccessToken;
    const token = new AccessToken(accountSid, apiKey, apiSecret, { identity });

    const chatSid = serviceSid || conversationsServiceSid;
    if (chatSid) {
      const ChatGrant = AccessToken.ChatGrant;
      token.addGrant(new ChatGrant({ serviceSid: chatSid }));
    }

    if (room) {
      const VideoGrant = AccessToken.VideoGrant;
      token.addGrant(new VideoGrant({ room }));
    }

    await audit.log('token.generate', { identity, room, serviceSid: chatSid });
    res.json({ token: token.toJwt() });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

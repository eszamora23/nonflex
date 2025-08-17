const express = require('express');
const twilio = require('twilio');

const router = express.Router();

function getTwilioConfig(req) {
  const {
    accountSid = process.env.TWILIO_ACCOUNT_SID,
    apiKey: apiKeySid = process.env.TWILIO_API_KEY,
    apiSecret: apiKeySecret = process.env.TWILIO_API_SECRET,
    conversationsServiceSid = process.env.TWILIO_CONVERSATIONS_SERVICE_SID,
  } = req.tenant?.twilio || {};
  return { accountSid, apiKeySid, apiKeySecret, conversationsServiceSid };
}

router.post('/conversations', (req, res, next) => {
  const { identity } = req.body;
  try {
    const {
      accountSid,
      apiKeySid,
      apiKeySecret,
      conversationsServiceSid,
    } = getTwilioConfig(req);

    if (
      !identity ||
      !accountSid ||
      !apiKeySid ||
      !apiKeySecret ||
      !conversationsServiceSid
    ) {
      return res.status(400).json({ error: 'Missing credentials or identity' });
    }

    const AccessToken = twilio.jwt.AccessToken;
    const token = new AccessToken(accountSid, apiKeySid, apiKeySecret, { identity });

    const ConversationsGrant = AccessToken.ConversationsGrant || AccessToken.ChatGrant;
    if (!ConversationsGrant) {
      return res.status(500).json({ error: 'Conversations grant not supported' });
    }
    token.addGrant(new ConversationsGrant({ serviceSid: conversationsServiceSid }));

    res.json({ token: token.toJwt() });
  } catch (err) {
    next(err);
  }
});

router.post('/video', (req, res, next) => {
  const { identity, room } = req.body;
  try {
    const { accountSid, apiKeySid, apiKeySecret } = getTwilioConfig(req);

    if (!identity || !accountSid || !apiKeySid || !apiKeySecret) {
      return res.status(400).json({ error: 'Missing credentials or identity' });
    }

    const AccessToken = twilio.jwt.AccessToken;
    const token = new AccessToken(accountSid, apiKeySid, apiKeySecret, { identity });

    const VideoGrant = AccessToken.VideoGrant;
    token.addGrant(new VideoGrant(room ? { room } : undefined));

    res.json({ token: token.toJwt() });
  } catch (err) {
    next(err);
  }
});

module.exports = router;


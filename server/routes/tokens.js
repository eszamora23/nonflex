const express = require('express');
const twilio = require('twilio');

const router = express.Router();

router.post('/', (req, res, next) => {
  const { identity, room, serviceSid } = req.body;
  try {
    const accountSid = req.tenant?.twilioAccountSid || process.env.TWILIO_ACCOUNT_SID;
    const apiKey = req.tenant?.twilioApiKey || process.env.TWILIO_API_KEY;
    const apiSecret = req.tenant?.twilioApiSecret || process.env.TWILIO_API_SECRET;

    if (!identity || !accountSid || !apiKey || !apiSecret) {
      return res.status(400).json({ error: 'Missing credentials or identity' });
    }

    const AccessToken = twilio.jwt.AccessToken;
    const token = new AccessToken(accountSid, apiKey, apiSecret, { identity });

    if (serviceSid) {
      const ChatGrant = AccessToken.ChatGrant;
      token.addGrant(new ChatGrant({ serviceSid }));
    }

    if (room) {
      const VideoGrant = AccessToken.VideoGrant;
      token.addGrant(new VideoGrant({ room }));
    }

    res.json({ token: token.toJwt() });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

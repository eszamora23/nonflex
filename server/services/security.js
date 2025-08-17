const twilio = require('twilio');

/**
 * Express middleware verifying incoming Twilio webhook requests using the
 * X-Twilio-Signature header and the tenant's auth token.
 */
function verifyTwilioSignature(req, res, next) {
  const token = req.tenant?.twilioAuthToken || req.tenant?.authToken || process.env.TWILIO_AUTH_TOKEN;
  if (!token) {
    return res.status(500).send('Twilio auth token not configured');
  }

  const signature = req.header('X-Twilio-Signature');
  const url = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
  const params = req.body || {};

  const valid = twilio.validateRequest(token, signature, url, params);
  if (!valid) {
    return res.status(403).send('Invalid Twilio signature');
  }

  return next();
}

module.exports = { verifyTwilioSignature };

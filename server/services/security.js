import twilio from 'twilio';

/**
 * Verifica la firma X-Twilio-Signature de los webhooks entrantes.
 * Usa PUBLIC_URL si está definido (ngrok/proxy) para evitar falsos negativos.
 * Permite bypass en desarrollo con TWILIO_SKIP_SIGNATURE=1.
 */
function verifyTwilioSignature(req, res, next) {
  if (process.env.TWILIO_SKIP_SIGNATURE === '1') return next();

  const token = req.tenant?.twilio?.authToken;
  if (!token) {
    return res.status(500).send('Twilio auth token not configured');
  }

  const signature = req.header('X-Twilio-Signature');
  const base = process.env.PUBLIC_URL || `${req.protocol}://${req.get('host')}`;
  const url = `${base}${req.originalUrl}`;
  const params = req.body || {};

  const valid = twilio.validateRequest(token, signature, url, params);
  if (!valid) {
    return res.status(403).send('Invalid Twilio signature');
  }

  return next();
}

export { verifyTwilioSignature };

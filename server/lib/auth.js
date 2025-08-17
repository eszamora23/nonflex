const jwt = require('jsonwebtoken');

// helper to sign JWTs with a shared secret
const secret = process.env.JWT_SECRET || 'changeme';

function sign(payload, options = {}) {
  return jwt.sign(payload, secret, { expiresIn: '1h', ...options });
}

function verify(token) {
  try {
    return jwt.verify(token, secret);
  } catch (err) {
    return null;
  }
}

// middleware to authenticate requests using Authorization: Bearer <token>
function auth(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const decoded = verify(token);
  if (!decoded) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  req.user = decoded;
  next();
}

module.exports = { sign, verify, auth };

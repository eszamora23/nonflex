const express = require('express');
const { auth } = require('../lib/auth');
const aiProvider = require('../services/aiProvider');

const router = express.Router();

// Generate AI reply for a user message
router.post('/reply', auth, async (req, res, next) => {
  const { userMsg, fromPhone } = req.body;
  if (!userMsg) {
    return res.status(400).json({ error: 'userMsg required' });
  }
  try {
    const reply = await aiProvider.generateReply({
      tenant: req.tenant,
      userMsg,
      fromPhone,
    });
    res.json({ reply });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

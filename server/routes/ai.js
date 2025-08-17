import express from 'express';
import { auth } from '../lib/auth.js';
import * as aiProvider from '../services/aiProvider.js';

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

export default router;

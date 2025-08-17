const express = require('express');
const state = require('../services/state');
const { makeTwilioClients } = require('../services/twilio');

const router = express.Router();

// Claim a conversation/task by acquiring a lock
router.post('/claim', async (req, res, next) => {
  const { conversationId } = req.body;
  if (!conversationId) {
    return res.status(400).json({ error: 'conversationId required' });
  }
  try {
    const token = await state.lock(conversationId);
    if (!token) {
      return res.status(409).json({ error: 'Task already claimed' });
    }
    const { voiceFrom, waFrom } = makeTwilioClients(req.tenant);
    await state.upsert(conversationId, { locked: true });
    res.json({ token, voiceFrom, waFrom });
  } catch (err) {
    next(err);
  }
});

// Release a previously claimed conversation/task
router.post('/release', async (req, res, next) => {
  const { conversationId, token } = req.body;
  if (!conversationId || !token) {
    return res.status(400).json({ error: 'conversationId and token required' });
  }
  try {
    await state.release(conversationId, token);
    await state.upsert(conversationId, { locked: false });
    res.json({ released: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

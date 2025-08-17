const express = require('express');
const state = require('../services/state');
const { makeTwilioClients } = require('../services/twilio');
const { auth } = require('../lib/auth');

const router = express.Router();

// All task routes require JWT auth
router.use(auth);

// Placeholder route for creating a task via TaskRouter
router.post('/create', (req, res) => {
  // TODO: integrate with TaskRouter to create tasks
  res.status(501).json({ error: 'Not implemented' });
});

// Placeholder route for listing tasks from TaskRouter
router.get('/list', (req, res) => {
  // TODO: integrate with TaskRouter to list tasks
  res.json({ tasks: [] });
});

// Claim a conversation/task by acquiring a lock
router.post('/claim', async (req, res, next) => {
  const conversationId = req.body.conversationSid || req.body.conversationId;
  if (!conversationId) {
    return res.status(400).json({ error: 'conversationId required' });
  }
  try {
    const token = await state.lock(conversationId);
    if (!token) {
      return res.status(409).json({ error: 'Task already claimed' });
    }

    const { conversations, voiceFrom, waFrom } = makeTwilioClients(req.tenant);

    // Fetch, update attrs.aiEnabled=false
    const convo = await conversations.v1.conversations(conversationId).fetch();
    const attrs = convo.attributes ? JSON.parse(convo.attributes) : {};
    attrs.aiEnabled = false;
    await conversations.v1
      .conversations(conversationId)
      .update({ attributes: JSON.stringify(attrs) });

    await state.upsert(conversationId, {
      locked: true,
      lockedBy: (req.user && (req.user.id || req.user.sub)) || null,
      updatedBy: 'tasks.claim',
    });

    res.json({ token, voiceFrom, waFrom });
  } catch (err) {
    next(err);
  }
});

// Release a previously claimed conversation/task
router.post('/release', async (req, res, next) => {
  const { aiEnabled = true } = req.body;
  const conversationId = req.body.conversationSid || req.body.conversationId;
  const token = req.body.token;

  if (!conversationId || !token) {
    return res.status(400).json({ error: 'conversationId and token required' });
  }
  try {
    const { conversations } = makeTwilioClients(req.tenant);

    // Fetch, update attrs.aiEnabled=aiEnabled
    const convo = await conversations.v1.conversations(conversationId).fetch();
    const attrs = convo.attributes ? JSON.parse(convo.attributes) : {};
    attrs.aiEnabled = !!aiEnabled;

    await conversations.v1
      .conversations(conversationId)
      .update({ attributes: JSON.stringify(attrs) });

    await state.release(conversationId, token);
    await state.upsert(conversationId, {
      locked: false,
      lockedBy: null,
      updatedBy: 'tasks.release',
    });

    res.json({ released: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

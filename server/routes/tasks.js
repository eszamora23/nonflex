import express from 'express';
import * as state from '../services/state.js';
import { makeTwilioClients } from '../services/twilio.js';
import { auth } from '../lib/auth.js';
import audit from '../services/audit.js';

const router = express.Router();

// Todas requieren JWT
router.use(auth);

/**
 * Crea una Task en TaskRouter (voz) con atributos básicos.
 * body: { channel?, dept?, lang?, attributes? }
 */
router.post('/create', async (req, res, next) => {
  try {
    const { twilio: tcfg } = req.tenant || {};
    if (!tcfg?.workspaceSid || !tcfg?.workflowSid) {
      return res.status(400).json({ error: 'TaskRouter not configured for tenant' });
    }

    const { taskrouter } = makeTwilioClients(req.tenant);
    const { channel = 'voice', dept = 'soporte', lang = 'es', attributes = {} } = req.body || {};
    const attrs = { channel, dept, lang, ...attributes };

    const task = await taskrouter.tasks.create({
      workflowSid: tcfg.workflowSid,
      attributes: JSON.stringify(attrs)
    });

    audit.log('task.create', {
      tenant: req.tenant?.id || null,
      user: req.user?.id || null,
      taskSid: task.sid,
      attributes: attrs
    });

    return res.status(201).json({ taskSid: task.sid, attributes: attrs });
  } catch (err) {
    next(err);
  }
});

/**
 * Lista Tasks del Workspace (pendientes por defecto).
 * query: assignmentStatus (pending,reserved,assigned,wrapping,completed,canceled)
 */
router.get('/list', async (req, res, next) => {
  try {
    const { twilio: tcfg } = req.tenant || {};
    if (!tcfg?.workspaceSid) {
      return res.status(400).json({ error: 'TaskRouter not configured for tenant' });
    }
    const { taskrouter } = makeTwilioClients(req.tenant);
    const assignmentStatus = req.query.assignmentStatus || 'pending';
    const tasks = await taskrouter.tasks.list({ assignmentStatus, limit: 50 });
    const out = tasks.map(t => ({
      sid: t.sid,
      status: t.assignmentStatus,
      age: t.age,
      priority: t.priority,
      attributes: safeParse(t.attributes)
    }));
    return res.json({ tasks: out });
  } catch (err) {
    next(err);
  }
});

function safeParse(v) {
  try { return JSON.parse(v || '{}'); } catch { return {}; }
}

/**
 * Claim de conversación/chat (desactiva IA y bloquea)
 * body: { conversationSid | conversationId }
 */
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

    audit.log('task.claim', {
      tenant: req.tenant?.id || null,
      user: req.user?.id || null,
      conversationId
    });

    res.json({ token, voiceFrom, waFrom });
  } catch (err) {
    next(err);
  }
});

/**
 * Release de la conversación/chat
 * body: { conversationSid|conversationId, token, aiEnabled? }
 */
router.post('/release', async (req, res, next) => {
  const { aiEnabled = true } = req.body;
  const conversationId = req.body.conversationSid || req.body.conversationId;
  const token = req.body.token;

  if (!conversationId || !token) {
    return res.status(400).json({ error: 'conversationId and token required' });
  }
  try {
    const { conversations } = makeTwilioClients(req.tenant);

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

    audit.log('task.release', {
      tenant: req.tenant?.id || null,
      user: req.user?.id || null,
      conversationId
    });

    res.json({ released: true });
  } catch (err) {
    next(err);
  }
});

export default router;

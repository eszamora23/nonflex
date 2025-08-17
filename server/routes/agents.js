import express from 'express';
import bcrypt from 'bcryptjs';
import Agent from '../models/Agent.js';
import { sign, auth } from '../lib/auth.js';
import { requireRole } from '../lib/rbac.js';
import audit from '../services/audit.js';
import * as agentStatus from '../services/agentStatus.js';

const router = express.Router();

// Agent login returning JWT (multi-tenant)
router.post('/login', async (req, res, next) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'username and password required' });
  }

  try {
    const query = req.tenantId ? { username, tenant: req.tenantId } : { username };
    const agent = await Agent.findOne(query);
    if (!agent) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const valid = await bcrypt.compare(password, agent.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = sign({
      id: agent._id.toString(),
      username: agent.username,
      roles: agent.roles,
      tenant: agent.tenant,
    });

    audit.log('agent.login', {
      agentId: agent._id.toString(),
      username: agent.username,
      tenant: agent.tenant,
      ip: req.ip
    });

    res.json({ token });
  } catch (err) {
    next(err);
  }
});

// authenticate and protect subsequent routes
router.use(auth);
router.use(requireRole('agent'));

// Get current agent info
router.get('/me', async (req, res, next) => {
  const agentId = req.user.id;
  try {
    let data = agentStatus.get(agentId);
    if (!data) {
      const query = req.tenantId ? { _id: agentId, tenant: req.tenantId } : { _id: agentId };
      const agent = await Agent.findOne(query, 'status skills languages');
      if (!agent) {
        return res.status(404).json({ error: 'Agent not found' });
      }
      data = { status: agent.status, skills: agent.skills, languages: agent.languages };
      agentStatus.set(agentId, data);
    }
    res.json({ id: agentId, ...data });
  } catch (err) {
    next(err);
  }
});

// Update agent status
router.post('/:id/status', async (req, res, next) => {
  const { status } = req.body;
  if (!status || !['available', 'busy', 'offline'].includes(status)) {
    return res.status(400).json({ error: 'invalid status' });
  }
  try {
    if (req.user.id !== req.params.id && !(req.user.roles || []).includes('admin')) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const query = req.tenantId ? { _id: req.params.id, tenant: req.tenantId } : { _id: req.params.id };
    const agent = await Agent.findOneAndUpdate(
      query,
      { status },
      { new: true, fields: 'status skills languages' }
    );
    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }
    const data = { status: agent.status, skills: agent.skills, languages: agent.languages };
    agentStatus.set(agent._id.toString(), data);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// Retrieve agent level
router.get('/:id/level', async (req, res, next) => {
  try {
    const query = req.tenantId ? { _id: req.params.id, tenant: req.tenantId } : { _id: req.params.id };
    const agent = await Agent.findOne(query, 'level');
    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }
    res.json({ level: agent.level });
  } catch (err) {
    next(err);
  }
});

export default router;

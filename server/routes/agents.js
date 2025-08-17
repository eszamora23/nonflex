import express from 'express';
import bcrypt from 'bcryptjs';
import Agent from '../models/Agent.js';
import { sign, auth } from '../lib/auth.js';
import { requireRole } from '../lib/rbac.js';

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
    res.json({ token });
  } catch (err) {
    next(err);
  }
});

// Get current authenticated agent info
router.get('/me', auth, requireRole('agent'), async (req, res, next) => {
  try {
    const agent = await Agent.findById(req.user.id);
    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }
    res.json({
      id: agent._id.toString(),
      username: agent.username,
      status: agent.status,
      skills: agent.skills,
      languages: agent.languages,
    });
  } catch (err) {
    next(err);
  }
});

// Update availability status for an agent
router.post('/:id/status', auth, requireRole('agent'), async (req, res, next) => {
  if (req.user.id !== req.params.id) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  const { status } = req.body;
  if (!status) {
    return res.status(400).json({ error: 'status required' });
  }
  try {
    const agent = await Agent.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }
    res.json({ id: agent._id.toString(), status: agent.status });
  } catch (err) {
    next(err);
  }
});

export default router;

import express from 'express';
import bcrypt from 'bcryptjs';
import Agent from '../models/Agent.js';
import { sign } from '../lib/auth.js';
import audit from '../services/audit.js';

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

export default router;

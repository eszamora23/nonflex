const express = require('express');
const bcrypt = require('bcryptjs');
const Agent = require('../models/Agent');
const { sign } = require('../lib/auth');

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

module.exports = router;

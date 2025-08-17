const express = require('express');
const bcrypt = require('bcryptjs');
const Agent = require('../models/Agent');
const { sign } = require('../lib/auth');
const audit = require('../services/audit');

const router = express.Router();

// Agent login returning JWT
router.post('/login', async (req, res, next) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'username and password required' });
  }

  try {
    const agent = await Agent.findOne({ username });
    if (!agent) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const valid = await bcrypt.compare(password, agent.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = sign({ id: agent._id, username: agent.username, roles: agent.roles });
    await audit.log('agent.login', { username });
    res.json({ token });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

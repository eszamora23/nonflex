const queue = require('./queue');

const states = new Map();

async function upsert(conversationId, data = {}) {
  const existing = states.get(conversationId) || {};
  const newState = { ...existing, ...data, updatedAt: new Date().toISOString() };
  states.set(conversationId, newState);
  return newState;
}

async function lock(conversationId, ttl = 30000) {
  return queue.lock(`state:${conversationId}`, ttl);
}

async function release(conversationId, token) {
  return queue.unlock(`state:${conversationId}`, token);
}

module.exports = { upsert, lock, release };

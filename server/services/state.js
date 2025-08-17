import { lock as lockKey, unlock as unlockKey } from './queue.js';

const states = new Map();

export async function upsert(conversationId, data = {}) {
  const existing = states.get(conversationId) || {};
  const newState = { ...existing, ...data, updatedAt: new Date().toISOString() };
  states.set(conversationId, newState);
  return newState;
}

export async function lock(conversationId, ttl = 30000) {
  return lockKey(`state:${conversationId}`, ttl);
}

export async function release(conversationId, token) {
  return unlockKey(`state:${conversationId}`, token);
}

import { lock as lockKey, unlock as unlockKey } from './queue.js';
import audit from './audit.js';
import ConversationState from '../models/ConversationState.js';

export async function upsert(conversationId, data = {}) {
  const { locked, ...attrs } = data;
  const update = {};
  // Persist arbitrary attributes under the `attributes` field
  for (const [key, value] of Object.entries(attrs)) {
    update[`attributes.${key}`] = value;
  }
  if (typeof locked === 'boolean') {
    update.locked = locked;
  }

  const doc = await ConversationState.findOneAndUpdate(
    { conversationId },
    { $set: update },
    { upsert: true, new: true, setDefaultsOnInsert: true, lean: true }
  );

  const state = { ...(doc.attributes || {}), locked: doc.locked, updatedAt: doc.updatedAt };
  audit.log('state.update', { conversationId, state });
  return state;
}

export async function lock(conversationId, ttl = 30000) {
  const token = await lockKey(`state:${conversationId}`, ttl);
  if (token) {
    await ConversationState.findOneAndUpdate(
      { conversationId },
      { $set: { locked: true } },
      { upsert: true }
    );
  }
  return token;
}

export async function release(conversationId, token) {
  await unlockKey(`state:${conversationId}`, token);
  await ConversationState.findOneAndUpdate(
    { conversationId },
    { $set: { locked: false } }
  );
}

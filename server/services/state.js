const crypto = require('crypto');
const ConversationState = require('../models/ConversationState');

function buildUpdate(tenant, conversationId, data = {}) {
  const set = {};
  const attributes = {};
  if (Object.prototype.hasOwnProperty.call(data, 'aiEnabled')) {
    set.aiEnabled = data.aiEnabled;
    delete data.aiEnabled;
  }
  Object.entries(data).forEach(([key, value]) => {
    attributes[`attributes.${key}`] = value;
  });
  return {
    $set: { ...set, ...attributes },
    $setOnInsert: { tenant, conversationId },
  };
}

async function upsert(tenant, conversationId, data = {}) {
  const update = buildUpdate(tenant, conversationId, { ...data });
  return ConversationState.findOneAndUpdate(
    { tenant, conversationId },
    update,
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );
}

async function lock(tenant, conversationId) {
  const token = crypto.randomUUID();
  const result = await ConversationState.findOneAndUpdate(
    { tenant, conversationId, lockedBy: { $in: [null, undefined] } },
    { $set: { lockedBy: token }, $setOnInsert: { tenant, conversationId } },
    { new: true, upsert: true },
  );

  if (!result) {
    const err = new Error('Task already claimed');
    err.status = 409;
    throw err;
  }

  return token;
}

async function release(tenant, conversationId, token) {
  const result = await ConversationState.findOneAndUpdate(
    { tenant, conversationId, lockedBy: token },
    { $set: { lockedBy: null } },
    { new: true },
  );

  if (!result) {
    const err = new Error('Invalid lock token');
    err.status = 409;
    throw err;
  }

  return true;
}

module.exports = { upsert, lock, release };


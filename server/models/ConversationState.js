const mongoose = require('mongoose');

const ConversationStateSchema = new mongoose.Schema({
  tenant: { type: String, required: true, index: true },
  conversationId: { type: String, required: true },
  attributes: { type: mongoose.Schema.Types.Mixed },
  aiEnabled: { type: Boolean, default: true },
  lockedBy: { type: String, default: null },
}, { timestamps: true });

ConversationStateSchema.index({ tenant: 1, conversationId: 1 }, { unique: true });

module.exports = mongoose.model('ConversationState', ConversationStateSchema);

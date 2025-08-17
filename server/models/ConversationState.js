const mongoose = require('mongoose');

const ConversationStateSchema = new mongoose.Schema({
  conversationId: { type: String, required: true, unique: true },
  attributes: { type: mongoose.Schema.Types.Mixed },
  locked: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('ConversationState', ConversationStateSchema);

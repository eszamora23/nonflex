import mongoose from 'mongoose';

const ConversationStateSchema = new mongoose.Schema({
  conversationId: { type: String, required: true, unique: true },
  attributes: { type: mongoose.Schema.Types.Mixed },
  locked: { type: Boolean, default: false },
}, { timestamps: true });

// Index for quick lookups by conversationId
ConversationStateSchema.index({ conversationId: 1 });

export default mongoose.model('ConversationState', ConversationStateSchema);

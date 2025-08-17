import mongoose from 'mongoose';

const ConversationStateSchema = new mongoose.Schema({
  conversationId: { type: String, required: true, unique: true },
  attributes: { type: mongoose.Schema.Types.Mixed },
  locked: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model('ConversationState', ConversationStateSchema);

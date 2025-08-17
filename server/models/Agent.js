import mongoose from 'mongoose';

const AgentSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  skills: [String],
  languages: [String],
  roles: [String],
  tenant: { type: String, required: true },
  level: { type: Number, default: 1 },
  status: { type: String, enum: ['available', 'busy', 'offline'], default: 'offline' },
}, { timestamps: true });

export default mongoose.model('Agent', AgentSchema);

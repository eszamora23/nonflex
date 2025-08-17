import mongoose from 'mongoose';

const AgentSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  skills: [String],
  languages: [String],
  status: { type: String, default: 'offline' },
  roles: [String],
  tenant: { type: String, required: true },
}, { timestamps: true });

export default mongoose.model('Agent', AgentSchema);

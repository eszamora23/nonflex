import mongoose from 'mongoose';

const AgentSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  skills: [String],
  languages: [String],
  roles: [String],
  tenant: { type: String, required: true },
}, { timestamps: true });

export default mongoose.model('Agent', AgentSchema);

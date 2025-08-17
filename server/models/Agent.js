const mongoose = require('mongoose');

const AgentSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  skills: [String],
  roles: [String],
}, { timestamps: true });

module.exports = mongoose.model('Agent', AgentSchema);

const mongoose = require('mongoose');
const { logger } = require('../lib/logger');

const auditSchema = new mongoose.Schema({
  action: { type: String, required: true },
  details: mongoose.Schema.Types.Mixed,
  timestamp: { type: Date, default: Date.now },
});

const Audit = mongoose.models.Audit || mongoose.model('Audit', auditSchema);

async function log(action, details = {}) {
  const entry = { action, details };
  // Always log to console/logger
  logger.info({ action, details }, 'audit');
  // Persist to Mongo if connected
  if (mongoose.connection.readyState === 1) {
    try {
      await Audit.create(entry);
    } catch (err) {
      logger.error({ err }, 'failed to persist audit log');
    }
  }
}

module.exports = { log };

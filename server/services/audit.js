import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';

const target = process.env.AUDIT_LOG_TARGET || 'file';
const level = process.env.AUDIT_LOG_LEVEL || 'info';
const rotationDays = parseInt(process.env.AUDIT_LOG_ROTATION_DAYS || '7', 10);

const levels = ['error', 'warn', 'info', 'debug'];
const levelIndex = levels.indexOf(level);

let AuditModel;
if (target === 'mongo') {
  const schema = new mongoose.Schema({
    event: String,
    data: mongoose.Schema.Types.Mixed,
    level: { type: String, default: 'info' },
    createdAt: { type: Date, default: Date.now }
  });
  AuditModel = mongoose.model('AuditLog', schema);
}

const logDir = path.resolve(process.cwd(), 'logs');

function ensureDir() {
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
}

function rotate() {
  if (rotationDays <= 0) return;
  const cutoff = Date.now() - rotationDays * 86400000;
  for (const file of fs.readdirSync(logDir)) {
    const match = file.match(/^audit-(\d{4}-\d{2}-\d{2})\.log$/);
    if (match) {
      const fileDate = new Date(match[1]).getTime();
      if (fileDate < cutoff) {
        fs.unlink(path.join(logDir, file), () => {});
      }
    }
  }
}

export function log(event, data = {}, lvl = 'info') {
  if (levels.indexOf(lvl) > levelIndex) return;
  const entry = { event, data, level: lvl, timestamp: new Date().toISOString() };
  if (target === 'mongo' && AuditModel) {
    AuditModel.create(entry).catch((err) => console.error('audit mongo error', err));
  } else {
    ensureDir();
    rotate();
    const file = path.join(logDir, `audit-${entry.timestamp.slice(0, 10)}.log`);
    fs.appendFile(file, JSON.stringify(entry) + '\n', (err) => {
      if (err) console.error('audit file error', err);
    });
  }
}

export default { log };

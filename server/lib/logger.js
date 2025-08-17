import pino from 'pino';

const logger = pino({ level: process.env.LOG_LEVEL || 'info' });

export function requestLogger(req, res, next) {
  req.log = logger.child({ tenantId: req.tenantId || 'unknown' });
  next();
}

export default logger;

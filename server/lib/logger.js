const pino = require('pino');
const pinoHttp = require('pino-http');

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
});

const httpLogger = pinoHttp({ logger });

module.exports = { logger, httpLogger };

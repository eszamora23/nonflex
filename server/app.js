import dotenv from 'dotenv';
import express from 'express';
import helmet from 'helmet';
import bodyParser from 'body-parser';
import cors from './lib/cors.js';
import rateLimit from './lib/rateLimit.js';
import tenantResolver from './lib/tenantResolver.js';
import logger, { requestLogger } from './lib/logger.js';
import { verifyTwilioSignature } from './services/security.js';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';

// route modules
import agents from './routes/agents.js';
import customers from './routes/customers.js';
import tasks from './routes/tasks.js';
import ai from './routes/ai.js';
import tokenRoutes from './routes/tokens.js';
import twilioWebhooks from './routes/twilio.webhooks.js';
import tenantsRoute from './routes/tenants.js';

dotenv.config();

const app = express();

// global middlewares
app.use(helmet());
app.use(cors);
app.use(rateLimit);
app.set('trust proxy', true); // necesario si usas ngrok/proxy
app.use(bodyParser.urlencoded({ extended: false })); // Twilio envía x-www-form-urlencoded
app.use(bodyParser.json());
app.use(tenantResolver);
app.use(requestLogger);

// routes
app.use('/agents', agents);
app.use('/customers', customers);
app.use('/tasks', tasks);
app.use('/ai', ai);
app.use('/tokens', tokenRoutes);
// Firma Twilio se verifica aquí antes de entrar al router
app.use('/tenants', tenantsRoute);
app.use('/webhooks/twilio', verifyTwilioSignature, twilioWebhooks);

// centralized error handler
app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  if (req.log) {
    req.log.error(err);
  } else {
    logger.error(err);
  }
  res.status(status).json({ error: message });
});

export default app;

// Connect to Mongo and start server if run directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const PORT = process.env.PORT || 3000;
  const MONGO_URL = process.env.MONGO_URL || process.env.MONGO_URI || 'mongodb://localhost/nonflex';
  mongoose
    .connect(MONGO_URL)
    .then(() => {
      app.listen(PORT, () => {
        logger.info(`Server listening on port ${PORT}`);
      });
    })
    .catch((err) => {
      logger.error({ err }, 'Mongo connection error');
      process.exit(1);
    });
}

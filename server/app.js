import dotenv from 'dotenv';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import cors from './lib/cors.js';
import rateLimit from './lib/rateLimit.js';
import tenantResolver from './lib/tenantResolver.js';
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

dotenv.config();

const app = express();

// global middlewares
app.use(helmet());
app.use(morgan('combined'));
app.use(cors);
app.use(rateLimit);
app.set('trust proxy', true); // necesario si usas ngrok/proxy
app.use(bodyParser.urlencoded({ extended: false })); // Twilio envía x-www-form-urlencoded
app.use(bodyParser.json());
app.use(tenantResolver);

// routes
app.use('/agents', agents);
app.use('/customers', customers);
app.use('/tasks', tasks);
app.use('/ai', ai);
app.use('/tokens', tokenRoutes);
// Firma Twilio se verifica aquí antes de entrar al router
app.use('/webhooks/twilio', verifyTwilioSignature, twilioWebhooks);

// centralized error handler
app.use((err, req, res, next) => {
  // eslint-disable-next-line no-console
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
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
        // eslint-disable-next-line no-console
        console.log(`Server listening on port ${PORT}`);
      });
    })
    .catch((err) => {
      // eslint-disable-next-line no-console
      console.error('Mongo connection error', err);
      process.exit(1);
    });
}

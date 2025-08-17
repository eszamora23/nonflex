const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cors = require('./lib/cors');
const rateLimit = require('./lib/rateLimit');
const tenantResolver = require('./lib/tenantResolver');
const { verifyTwilioSignature } = require('./services/security');
const mongoose = require('mongoose');

// route modules
const agents = require('./routes/agents');
const customers = require('./routes/customers');
const tasks = require('./routes/tasks');
const ai = require('./routes/ai');
const tokenRoutes = require('./routes/tokens');
const twilioWebhooks = require('./routes/twilio.webhooks');

const app = express();

// global middlewares
app.use(helmet());
app.use(morgan('combined'));
app.use(cors);
app.use(rateLimit);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(tenantResolver);

// routes
app.use('/agents', agents);
app.use('/customers', customers);
app.use('/tasks', tasks);
app.use('/ai', ai);
app.use('/tokens', tokenRoutes);
app.use('/webhooks/twilio', verifyTwilioSignature, twilioWebhooks);

// centralized error handler
app.use((err, req, res, next) => {
  console.error(err); // eslint-disable-line no-console
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

module.exports = app;

// Connect to Mongo and start server if run directly
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost/nonflex';
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

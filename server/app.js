const express = require('express');
const tenantResolver = require('./lib/tenantResolver');
const { verifyTwilioSignature } = require('./services/security');

const app = express();

// parse incoming webhook bodies
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// resolve tenant from header before handling routes
app.use(tenantResolver);

// verify twilio requests for webhook endpoints
app.use('/webhooks', verifyTwilioSignature);

// routes would be added below
module.exports = app;

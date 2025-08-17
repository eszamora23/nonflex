const express = require('express');
const tenantResolver = require('./lib/tenantResolver');

const app = express();

// resolve tenant from header before handling routes
app.use(tenantResolver);

// routes would be added below
module.exports = app;

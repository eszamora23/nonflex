const express = require('express');
const CRM = require('../services/crm');

const router = express.Router();

// Retrieve customer by phone number
router.get('/phone/:phone', async (req, res, next) => {
  try {
    const customer = await CRM.getByPhone(req.tenant, req.params.phone);
    res.json(customer);
  } catch (err) {
    next(err);
  }
});

// Retrieve customer by external ID
router.get('/:id', async (req, res, next) => {
  try {
    const customer = await CRM.getByExternalId(req.tenant, req.params.id);
    res.json(customer);
  } catch (err) {
    next(err);
  }
});

module.exports = router;

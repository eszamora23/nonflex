import express from 'express';
import * as CRM from '../services/crm.js';

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

export default router;

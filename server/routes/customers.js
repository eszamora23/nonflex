import express from 'express';
import * as CRM from '../services/crm.js';
import Order from '../models/Order.js';
import Ticket from '../models/Ticket.js';

const router = express.Router();

// Retrieve customer by phone number (matches any stored phone)
router.get('/phone/:phone', async (req, res, next) => {
  try {
    const customer = await CRM.getByPhone(req.tenant, req.params.phone);
    res.json(customer);
  } catch (err) {
    next(err);
  }
});

// Orders routes
router.get('/:id/orders', async (req, res, next) => {
  try {
    const orders = await Order.find({ tenant: req.tenantId, customer: req.params.id });
    res.json(orders);
  } catch (err) {
    next(err);
  }
});

router.post('/:id/orders', async (req, res, next) => {
  try {
    const order = await Order.create({ ...req.body, tenant: req.tenantId, customer: req.params.id });
    res.status(201).json(order);
  } catch (err) {
    next(err);
  }
});

// Tickets routes
router.get('/:id/tickets', async (req, res, next) => {
  try {
    const tickets = await Ticket.find({ tenant: req.tenantId, customer: req.params.id });
    res.json(tickets);
  } catch (err) {
    next(err);
  }
});

router.post('/:id/tickets', async (req, res, next) => {
  try {
    const ticket = await Ticket.create({ ...req.body, tenant: req.tenantId, customer: req.params.id });
    res.status(201).json(ticket);
  } catch (err) {
    next(err);
  }
});

// Retrieve customer by external ID
router.get('/:externalId', async (req, res, next) => {
  try {
    const customer = await CRM.getByExternalId(req.tenant, req.params.externalId);
    res.json(customer);
  } catch (err) {
    next(err);
  }
});

export default router;

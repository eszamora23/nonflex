const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function loadModels() {
  try {
    const { default: Agent } = await import('../server/models/Agent.js');
    const { default: Customer } = await import('../server/models/Customer.js');
    const { default: Order } = await import('../server/models/Order.js');
    const { default: Ticket } = await import('../server/models/Ticket.js');
    return { Agent, Customer, Order, Ticket };
  } catch (err) {
    const Agent = require('../server/models/Agent');
    const Customer = require('../server/models/Customer');
    const Order = require('../server/models/Order');
    const Ticket = require('../server/models/Ticket');
    return { Agent, Customer, Order, Ticket };
  }
}

const MONGO_URI = process.env.MONGO_URI || process.env.MONGO_URL || 'mongodb://localhost/nonflex';
const TENANT = process.env.DEFAULT_TENANT || 'tenant1';

async function seed() {
  const { Agent, Customer, Order, Ticket } = await loadModels();
  await mongoose.connect(MONGO_URI);

  try {
    await Agent.deleteMany({ tenant: TENANT });
    await Customer.deleteMany({ tenant: TENANT });
    await Order.deleteMany({ tenant: TENANT });
    await Ticket.deleteMany({ tenant: TENANT });

    const agents = [
      {
        username: 'sarah',
        password: 'password123',
        skills: ['support', 'sales'],
        languages: ['en', 'es'],
        roles: ['agent'],
      },
    ];

    for (const a of agents) {
      const passwordHash = await bcrypt.hash(a.password, 10);
      await Agent.create({
        username: a.username,
        passwordHash,
        skills: a.skills,
        languages: a.languages,
        roles: a.roles,
        tenant: TENANT,
      });
    }

    const customersData = [
      {
        tenant: TENANT,
        externalId: 'cust-ext-1',
        profile: {
          firstName: 'Michael',
          lastName: 'Johnson',
          email: 'michael.johnson@example.com',
          phone: '+15555551234',
        },
        phones: ['+15555551234', '+15555550000'],
        language: 'en',
        tier: 'gold',
        notes: 'Frequent shopper',
        addresses: [
          {
            line1: '742 Evergreen Terrace',
            city: 'Springfield',
            state: 'IL',
            postalCode: '62704',
            country: 'US',
          },
        ],
      },
      {
        tenant: TENANT,
        externalId: 'cust-ext-2',
        profile: {
          firstName: 'Emily',
          lastName: 'Davis',
          email: 'emily.davis@example.com',
          phone: '+15555554321',
        },
        phones: ['+15555554321'],
        language: 'es',
        tier: 'silver',
        notes: 'Interested in promotions',
        addresses: [
          {
            line1: '1600 Amphitheatre Parkway',
            city: 'Mountain View',
            state: 'CA',
            postalCode: '94043',
            country: 'US',
          },
        ],
      },
    ];

    const customers = await Customer.insertMany(customersData);

    const orders = [
      { tenant: TENANT, customer: customers[0]._id, productId: 'SKU123', quantity: 1, price: 49.99, status: 'shipped' },
      { tenant: TENANT, customer: customers[0]._id, productId: 'SKU124', quantity: 2, price: 29.99, status: 'processing' },
      { tenant: TENANT, customer: customers[1]._id, productId: 'SKU200', quantity: 1, price: 99.99, status: 'delivered' },
    ];

    await Order.insertMany(orders);

    const tickets = [
      { tenant: TENANT, customer: customers[0]._id, subject: 'Where is my order?', description: 'Order has not arrived.', status: 'open' },
      { tenant: TENANT, customer: customers[1]._id, subject: 'Return request', description: 'I want to return my item.', status: 'open' },
    ];

    await Ticket.insertMany(tickets);
  } finally {
    await mongoose.disconnect();
  }
}

seed()
  .then(() => {
    console.log('Seed data inserted');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Seed failed', err);
    process.exit(1);
  });

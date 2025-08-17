const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function loadModels() {
  try {
    const { default: Agent } = await import('../server/models/Agent.js');
    const { default: Customer } = await import('../server/models/Customer.js');
    return { Agent, Customer };
  } catch (err) {
    const Agent = require('../server/models/Agent');
    const Customer = require('../server/models/Customer');
    return { Agent, Customer };
  }
}

const MONGO_URI = process.env.MONGO_URI || process.env.MONGO_URL || 'mongodb://localhost/nonflex';
const TENANT = process.env.DEFAULT_TENANT || 'tenant1';

async function seed() {
  const { Agent, Customer } = await loadModels();
  await mongoose.connect(MONGO_URI);

  try {
    await Agent.deleteMany({ tenant: TENANT });
    await Customer.deleteMany({ tenant: TENANT });

    const agents = [
      {
        username: 'sarah',
        password: 'password123',
        skills: ['support', 'sales'],
        languages: ['en', 'es'],
        roles: ['agent'],
        level: 1,
        status: 'offline',
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
        level: a.level,
        status: a.status,
      });
    }

    const customers = [
      {
        tenant: TENANT,
        profile: {
          firstName: 'Michael',
          lastName: 'Johnson',
          email: 'michael.johnson@example.com',
          phone: '+15555551234',
        },
        addresses: [
          {
            line1: '742 Evergreen Terrace',
            city: 'Springfield',
            state: 'IL',
            postalCode: '62704',
            country: 'US',
          },
        ],
        orders: [
          { productId: 'SKU123', quantity: 1, price: 49.99, status: 'shipped' },
          { productId: 'SKU124', quantity: 2, price: 29.99, status: 'processing' },
        ],
      },
      {
        tenant: TENANT,
        profile: {
          firstName: 'Emily',
          lastName: 'Davis',
          email: 'emily.davis@example.com',
          phone: '+15555554321',
        },
        addresses: [
          {
            line1: '1600 Amphitheatre Parkway',
            city: 'Mountain View',
            state: 'CA',
            postalCode: '94043',
            country: 'US',
          },
        ],
        orders: [
          { productId: 'SKU200', quantity: 1, price: 99.99, status: 'delivered' },
        ],
      },
    ];

    await Customer.insertMany(customers);
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

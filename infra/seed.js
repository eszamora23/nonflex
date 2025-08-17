const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Agent = require('../server/models/Agent');
const Customer = require('../server/models/Customer');

const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost/nonflex';

async function seed() {
  await mongoose.connect(MONGO_URL);

  await Agent.deleteMany({});
  await Customer.deleteMany({});

  const agents = [
    { username: 'alice', password: 'password', skills: ['support'], roles: ['agent'] },
    { username: 'bob', password: 'password', skills: ['sales'], roles: ['agent'] },
  ];

  for (const a of agents) {
    const passwordHash = await bcrypt.hash(a.password, 10);
    await Agent.create({
      username: a.username,
      passwordHash,
      skills: a.skills,
      roles: a.roles,
    });
  }

  const customers = [
    {
      profile: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '+15555550100',
      },
      addresses: [
        { line1: '123 Main St', city: 'Springfield', state: 'CA', postalCode: '12345', country: 'US' },
      ],
      orders: [
        { productId: 'SKU123', quantity: 1, price: 19.99, status: 'shipped' },
      ],
    },
    {
      profile: {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        phone: '+15555550101',
      },
      addresses: [
        { line1: '456 Oak Ave', city: 'Metropolis', state: 'NY', postalCode: '67890', country: 'US' },
      ],
      orders: [
        { productId: 'SKU456', quantity: 2, price: 9.99, status: 'processing' },
      ],
    },
  ];

  await Customer.insertMany(customers);

  console.log('Seed data inserted');
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seed failed', err);
  process.exit(1);
});

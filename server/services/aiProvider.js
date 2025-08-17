const OpenAI = require('openai');
const CRM = require('./crm');

function getClient(tenant = {}) {
  const apiKey = tenant.openaiApiKey || process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OpenAI API key is not configured');
  }
  return new OpenAI({ apiKey });
}

function buildSystemPrompt(customer) {
  let prompt = 'You are a helpful customer support assistant. Use the provided context to answer user messages accurately and concisely. If the question is outside of your knowledge or violates policy, respond that you cannot help.';
  if (customer) {
    const parts = [];
    if (customer.name) parts.push(`Name: ${customer.name}`);
    if (customer.email) parts.push(`Email: ${customer.email}`);
    if (customer.id) parts.push(`ID: ${customer.id}`);
    prompt += `\n\nCustomer Info:\n${parts.join('\n')}`;
  }
  return prompt;
}

const tools = [
  {
    type: 'function',
    function: {
      name: 'lookup_customer',
      description: 'Look up customer information by phone number',
      parameters: {
        type: 'object',
        properties: {
          phone: {
            type: 'string',
            description: 'E.164 formatted phone number',
          },
        },
        required: ['phone'],
      },
    },
  },
];

async function generateReply({ tenant = {}, model = 'gpt-4o-mini', userMsg, fromPhone }) {
  if (!userMsg) {
    throw new Error('userMsg is required');
  }
  const client = getClient(tenant);

  let customer;
  if (fromPhone) {
    try {
      customer = await CRM.getByPhone(tenant, fromPhone);
    } catch (err) {
      customer = null;
    }
  }

  const systemPrompt = buildSystemPrompt(customer);
  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userMsg },
  ];

  const completion = await client.chat.completions.create({
    model,
    messages,
    tools,
    temperature: 0.2,
  });

  const choice = completion.choices && completion.choices[0];
  return choice && choice.message && choice.message.content ? choice.message.content.trim() : '';
}

module.exports = { generateReply };

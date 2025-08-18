import OpenAI from 'openai';
import * as CRM from './crm.js';
import { checkContent } from './contentFilter.js';
import { check as checkRateLimit } from './conversationRateLimit.js';

function getClient(tenant = {}) {
  const apiKey = tenant.ai?.openaiApiKey || process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OpenAI API key is not configured');
  }
  return new OpenAI({ apiKey });
}

function buildSystemPrompt(customer) {
  let prompt = 'Eres un asistente de soporte para Acme Retail. Responde en español de forma precisa y concisa utilizando la información disponible. Si el cliente presenta una queja, solicita un reembolso o faltan datos para ayudarle, debes transferir la conversación a un agente humano.';
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
          phone: { type: 'string', description: 'E.164 formatted phone number' }
        },
        required: ['phone']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_order_by_id',
      description: 'Retrieve order information by order ID',
      parameters: {
        type: 'object',
        properties: {
          orderId: { type: 'string', description: 'Order identifier' }
        },
        required: ['orderId']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'create_ticket',
      description: 'Create a support ticket for a customer',
      parameters: {
        type: 'object',
        properties: {
          customerId: { type: 'string', description: 'Customer identifier' },
          subject: { type: 'string', description: 'Short ticket subject' },
          description: { type: 'string', description: 'Detailed description of the issue' }
        },
        required: ['customerId', 'subject', 'description']
      }
    }
  }
];
export async function generateReply({ tenant = {}, model = 'gpt-4o-mini', userMsg, fromPhone, conversationId, aiEnabled = true }) {
  if (!userMsg) throw new Error('userMsg is required');

  if (!aiEnabled) {
    return { reply: '', handoff: true };
  }

  const content = checkContent(userMsg);
  if (!content.allowed) {
    return { reply: '', handoff: true };
  }

  if (conversationId && !checkRateLimit(conversationId)) {
    return { reply: '', handoff: true };
  }

  const client = getClient(tenant);

  let customer = null;
  if (fromPhone) {
    try {
      customer = await CRM.getByPhone(tenant, fromPhone);
    } catch {
      customer = null;
    }
  }

  const systemPrompt = buildSystemPrompt(customer);
  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userMsg }
  ];

  while (true) {
    const completion = await client.chat.completions.create({
      model,
      messages,
      tools,
      temperature: 0.2
    });

    const choice = completion.choices?.[0];
    const msg = choice?.message;
    if (!msg) return { reply: '', handoff: false };

    if (msg.tool_calls && msg.tool_calls.length > 0) {
      messages.push(msg);
      for (const call of msg.tool_calls) {
        const args = safeJson(call.function.arguments);
        let result;
        try {
          switch (call.function.name) {
            case 'lookup_customer':
              result = await CRM.getByPhone(tenant, args.phone);
              break;
            case 'get_order_by_id':
              result = await CRM.getOrderById(tenant, args.orderId);
              break;
            case 'create_ticket':
              result = await CRM.createTicket(tenant, args);
              break;
            default:
              result = { error: 'Unknown function' };
          }
        } catch (err) {
          result = { error: err.message };
        }
        messages.push({
          role: 'tool',
          tool_call_id: call.id,
          name: call.function.name,
          content: JSON.stringify(result)
        });
      }
      continue;
    }

    return { reply: msg.content ? msg.content.trim() : '', handoff: false };
  }
}

function safeJson(str) {
  try {
    return JSON.parse(str || '{}');
  } catch {
    return {};
  }
}

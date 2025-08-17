let fetchFn = global.fetch;
if (!fetchFn) {
  try {
    fetchFn = require('node-fetch');
  } catch (err) {
    throw new Error('Fetch API not available');
  }
}

async function request(tenant = {}, path = '') {
  const baseUrl = tenant.crmBaseUrl || process.env.CRM_BASE_URL;
  if (!baseUrl) {
    throw new Error('CRM base URL is not configured');
  }
  const apiKey = tenant.crmApiKey || process.env.CRM_API_KEY;
  const url = `${baseUrl}${path}`;
  const headers = apiKey ? { Authorization: `Bearer ${apiKey}` } : {};
  const res = await fetchFn(url, { headers });
  if (!res.ok) {
    throw new Error(`CRM request failed with status ${res.status}`);
  }
  return res.json();
}

async function getByPhone(tenant, phone) {
  return request(tenant, `/contacts/phone/${encodeURIComponent(phone)}`);
}

async function getByExternalId(tenant, externalId) {
  return request(tenant, `/contacts/${encodeURIComponent(externalId)}`);
}

async function getOrderById(tenant, orderId) {
  return request(tenant, `/orders/${encodeURIComponent(orderId)}`);
}

module.exports = { getByPhone, getByExternalId, getOrderById };

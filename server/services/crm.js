async function getFetch() {
  if (globalThis.fetch) return globalThis.fetch.bind(globalThis);
  const mod = await import('node-fetch');
  return mod.default;
}

async function request(tenant = {}, path = '') {
  const baseUrl = tenant.crmBaseUrl || process.env.CRM_BASE_URL;
  if (!baseUrl) throw new Error('CRM base URL is not configured');

  const apiKey = tenant.crmApiKey || process.env.CRM_API_KEY;
  const url = `${baseUrl}${path}`;
  const headers = apiKey ? { Authorization: `Bearer ${apiKey}` } : {};
  const fetchFn = await getFetch();
  const res = await fetchFn(url, { headers });
  if (!res.ok) {
    throw new Error(`CRM request failed with status ${res.status}`);
  }
  return res.json();
}

export async function getByPhone(tenant, phone) {
  return request(tenant, `/contacts/phone/${encodeURIComponent(phone)}`);
}

export async function getByExternalId(tenant, externalId) {
  return request(tenant, `/contacts/${encodeURIComponent(externalId)}`);
}

export async function getOrderById(tenant, orderId) {
  return request(tenant, `/orders/${encodeURIComponent(orderId)}`);
}

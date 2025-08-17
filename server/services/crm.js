async function getFetch() {
  if (globalThis.fetch) return globalThis.fetch.bind(globalThis);
  const mod = await import('node-fetch');
  return mod.default;
}

async function request(tenant = {}, path = '', options = {}) {
  const baseUrl = tenant.crmBaseUrl || process.env.CRM_BASE_URL;
  if (!baseUrl) throw new Error('CRM base URL is not configured');

  const apiKey = tenant.crmApiKey || process.env.CRM_API_KEY;
  const url = `${baseUrl}${path}`;
  const headers = apiKey ? { Authorization: `Bearer ${apiKey}` } : {};
  const fetchFn = await getFetch();
  const res = await fetchFn(url, { ...options, headers: { ...headers, ...(options.headers || {}) } });
  if (!res.ok) {
    throw new Error(`CRM request failed with status ${res.status}`);
  }
  return res.json();
}

function mapCustomer(data = {}) {
  return {
    externalId: data.externalId ?? data.id,
    profile: {
      firstName: data.firstName ?? data.profile?.firstName,
      lastName: data.lastName ?? data.profile?.lastName,
      email: data.email ?? data.profile?.email,
      phone: data.phone ?? data.profile?.phone,
    },
    phones: data.phones ?? (data.phone ? [data.phone] : []),
    language: data.language,
    tier: data.tier,
    notes: data.notes,
    addresses: data.addresses ?? [],
    orders: data.orders ?? [],
  };
}

export async function getByPhone(tenant, phone) {
  const data = await request(tenant, `/contacts/phone/${encodeURIComponent(phone)}`);
  return mapCustomer(data);
}

export async function getByExternalId(tenant, externalId) {
  const data = await request(tenant, `/contacts/${encodeURIComponent(externalId)}`);
  return mapCustomer(data);
}

export async function getOrderById(tenant, orderId) {
  return request(tenant, `/orders/${encodeURIComponent(orderId)}`);
}

export async function createTicket(tenant, data) {
  return request(tenant, '/tickets', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data || {}),
  });
}

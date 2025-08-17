import tenants from '../../infra/tenants.json' assert { type: 'json' };

export default function tenantResolver(req, res, next) {
  const tenantId = req.header('X-Tenant-Id') || process.env.DEFAULT_TENANT || null;
  req.tenantId = tenantId || null;
  const tenant = tenantId && tenants[tenantId] ? tenants[tenantId] : null;
  if (tenant) {
    req.tenant = {
      ...tenant,
      twilio: tenant.twilio || {},
      ai: tenant.ai || {},
    };
  } else {
    req.tenant = null;
  }
  next();
};

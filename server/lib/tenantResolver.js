const tenants = require('../../infra/tenants.json');

module.exports = function tenantResolver(req, res, next) {
  const tenantId = req.header('X-Tenant-Id');
  req.tenantId = tenantId || null;
  req.tenant = tenantId && tenants[tenantId] ? tenants[tenantId] : null;
  next();
};

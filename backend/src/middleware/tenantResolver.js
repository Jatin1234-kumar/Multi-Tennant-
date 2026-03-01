// Tenant resolver block: maps request host to tenant metadata.
const tenantService = require('../services/tenant.service');
const { AppError } = require('../utils/errors');

// Host parsing block: extracts subdomain for localhost and production-style hosts.
function extractSubdomain(host) {
  if (!host) return null;

  const cleanHost = host.split(':')[0].toLowerCase();
  const parts = cleanHost.split('.');

  if (cleanHost.endsWith('localhost') && parts.length >= 2) {
    return parts[0];
  }

  if (parts.length < 3) {
    return null;
  }

  return parts[0];
}

// Request guard block: resolves tenant and attaches it to req.tenant.
async function tenantResolver(req, _res, next) {
  try {
    const subdomain = extractSubdomain(req.headers.host);

    if (!subdomain) {
      throw new AppError('Tenant subdomain is missing', 400);
    }

    const tenant = await tenantService.getBySubdomain(subdomain);

    if (!tenant) {
      throw new AppError('Tenant not found', 404);
    }

    req.tenant = tenant;
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = tenantResolver;

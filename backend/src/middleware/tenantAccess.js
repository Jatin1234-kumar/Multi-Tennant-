// Tenant access middleware block: prevents cross-tenant token usage.
const { AppError } = require('../utils/errors');

function tenantAccessMiddleware(req, _res, next) {
  // Presence check block: both auth user and resolved tenant must exist.
  if (!req.user || !req.tenant) {
    return next(new AppError('Unauthorized tenant access', 401));
  }

  // Tenant match block: token tenantId must match subdomain tenant id.
  if (req.user.tenantId !== req.tenant.id) {
    return next(new AppError('Cross-tenant access denied', 403));
  }

  return next();
}

module.exports = tenantAccessMiddleware;

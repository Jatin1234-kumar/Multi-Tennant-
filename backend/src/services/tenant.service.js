// Tenant service block: creates tenant metadata + schema + initial admin user.
const tenantRepository = require('../repositories/tenant.repository');
const { hashPassword } = require('../utils/password');
const { AppError } = require('../utils/errors');

function buildSchemaName(subdomain) {
  // Schema naming block: derives safe schema name from subdomain.
  const sanitized = subdomain.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  return `tenant_${sanitized}`;
}

async function getBySubdomain(subdomain) {
  return tenantRepository.findBySubdomain(subdomain);
}

async function createTenant({ name, subdomain, adminEmail, adminPassword }) {
  // Provisioning input block: computes final tenant schema name.
  const schemaName = buildSchemaName(subdomain);

  if (schemaName.length > 63) {
    throw new AppError('Generated schema name is too long', 400);
  }

  // Password block: hashes admin password before persistence.
  const adminPasswordHash = await hashPassword(adminPassword);

  return tenantRepository.createTenantAndSchema({
    name,
    subdomain,
    schemaName,
    adminEmail,
    adminPasswordHash
  });
}

module.exports = {
  getBySubdomain,
  createTenant
};

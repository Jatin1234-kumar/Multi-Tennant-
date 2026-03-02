// Tenant service block: creates tenant metadata + schema + initial admin user.
const tenantRepository = require('../repositories/tenant.repository');
const env = require('../config/env');
const { hashPassword } = require('../utils/password');
const { AppError } = require('../utils/errors');

// Tenant cache block: short-lived in-memory cache keyed by subdomain.
const tenantCache = new Map();

function buildSchemaName(subdomain) {
  // Schema naming block: derives safe schema name from subdomain.
  const sanitized = subdomain.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  return `tenant_${sanitized}`;
}

async function getBySubdomain(subdomain) {
  const key = subdomain.toLowerCase();
  const cached = tenantCache.get(key);

  if (cached && cached.expiresAt > Date.now()) {
    return cached.value;
  }

  const tenant = await tenantRepository.findBySubdomain(key);

  if (tenant) {
    tenantCache.set(key, {
      value: tenant,
      expiresAt: Date.now() + env.tenantCacheTtlMs
    });
  }

  return tenant;
}

async function createTenant({ name, subdomain, adminEmail, adminPassword }) {
  // Provisioning input block: computes final tenant schema name.
  const schemaName = buildSchemaName(subdomain);

  if (schemaName.length > 63) {
    throw new AppError('Generated schema name is too long', 400);
  }

  // Password block: hashes admin password before persistence.
  const adminPasswordHash = await hashPassword(adminPassword);

  let created;

  try {
    created = await tenantRepository.createTenantAndSchema({
      name,
      subdomain,
      schemaName,
      adminEmail,
      adminPasswordHash
    });
  } catch (error) {
    if (error.code === '23505') {
      throw new AppError('Tenant or admin already exists', 409);
    }

    throw error;
  }

  tenantCache.set(created.tenant.subdomain.toLowerCase(), {
    value: created.tenant,
    expiresAt: Date.now() + env.tenantCacheTtlMs
  });

  return created;
}

module.exports = {
  getBySubdomain,
  createTenant
};

// Tenant repository block: system-level tenant and bootstrap persistence.
const { query, withTransaction, assertSchemaName } = require('../config/db');
const { runTenantMigrations } = require('../db/migrationRunner');

async function findBySubdomain(subdomain) {
  // Lookup block: resolves tenant by incoming subdomain.
  const result = await query(
    `SELECT id, name, schema_name AS "schemaName", subdomain, created_at AS "createdAt"
     FROM public.tenants
     WHERE subdomain = $1`,
    [subdomain]
  );

  return result.rows[0] || null;
}

async function findById(id) {
  const result = await query(
    `SELECT id, name, schema_name AS "schemaName", subdomain, created_at AS "createdAt"
     FROM public.tenants
     WHERE id = $1`,
    [id]
  );

  return result.rows[0] || null;
}

async function createTenantAndSchema({ name, subdomain, schemaName, adminEmail, adminPasswordHash }) {
  // Guard block: schema name must match backend-safe pattern.
  assertSchemaName(schemaName);

  // Transaction block: tenant insert, schema create, migrations, and admin bootstrap.
  return withTransaction(async (client) => {
    const tenantResult = await client.query(
      `INSERT INTO public.tenants (name, schema_name, subdomain)
       VALUES ($1, $2, $3)
       RETURNING id, name, schema_name AS "schemaName", subdomain, created_at AS "createdAt"`,
      [name, schemaName, subdomain]
    );

    await client.query(`CREATE SCHEMA IF NOT EXISTS "${schemaName}"`);

    await runTenantMigrations(client, schemaName);

    const adminResult = await client.query(
      `INSERT INTO public.users (email, password, tenant_id, role)
       VALUES ($1, $2, $3, 'Admin')
       RETURNING id, email, tenant_id AS "tenantId", role, created_at AS "createdAt"`,
      [adminEmail, adminPasswordHash, tenantResult.rows[0].id]
    );

    return {
      tenant: tenantResult.rows[0],
      admin: adminResult.rows[0]
    };
  });
}

module.exports = {
  findBySubdomain,
  findById,
  createTenantAndSchema
};

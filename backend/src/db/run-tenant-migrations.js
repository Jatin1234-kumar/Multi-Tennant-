// Tenant migration runner block: reapplies tenant migrations to all existing tenant schemas.
const { query, withTransaction, pool } = require('../config/db');
const { runTenantMigrations } = require('./migrationRunner');

async function run() {
  const tenantsResult = await query(
    `SELECT id, schema_name AS "schemaName", subdomain
     FROM public.tenants
     ORDER BY id ASC`
  );

  for (const tenant of tenantsResult.rows) {
    await withTransaction(async (client) => {
      await runTenantMigrations(client, tenant.schemaName);
    });

    console.log(`Tenant migrations applied: ${tenant.subdomain} (${tenant.schemaName})`);
  }

  console.log(`Processed ${tenantsResult.rows.length} tenant schemas`);
}

run()
  .then(async () => {
    await pool.end();
    process.exit(0);
  })
  .catch(async (error) => {
    console.error('Tenant migrations failed:', error.message);
    await pool.end();
    process.exit(1);
  });

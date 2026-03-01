// DB configuration block: PostgreSQL pool for all requests.
const { Pool } = require('pg');
const env = require('./env');

const pool = new Pool({
  connectionString: env.databaseUrl,
  max: env.dbPoolMax,
  idleTimeoutMillis: env.dbIdleTimeoutMs
});

// Pool safety block: catches unexpected idle client errors.
pool.on('error', (error) => {
  console.error('Unexpected PostgreSQL pool error:', error);
});

// Tenant schema validation block: only allow strict schema naming format.
const TENANT_SCHEMA_REGEX = /^tenant_[a-z0-9_]+$/;

function assertSchemaName(schemaName) {
  if (!TENANT_SCHEMA_REGEX.test(schemaName)) {
    throw new Error('Invalid tenant schema name');
  }
}

async function query(text, params = []) {
  return pool.query(text, params);
}

// Generic transaction block: BEGIN/COMMIT/ROLLBACK lifecycle wrapper.
async function withTransaction(handler) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    const result = await handler(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// Tenant transaction block: sets search_path per transaction for isolation.
async function withTenantTransaction(schemaName, handler) {
  assertSchemaName(schemaName);

  return withTransaction(async (client) => {
    await client.query("SELECT set_config('search_path', $1, true)", [`${schemaName},public`]);
    return handler(client);
  });
}

module.exports = {
  pool,
  query,
  withTransaction,
  withTenantTransaction,
  assertSchemaName
};

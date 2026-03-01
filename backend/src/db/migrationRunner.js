// Migration runner block: executes SQL files for public and tenant schemas.
const fs = require('fs');
const path = require('path');
const { query } = require('../config/db');

function getSqlFiles(dirPath) {
  // File discovery block: load SQL files in deterministic sorted order.
  return fs
    .readdirSync(dirPath)
    .filter((fileName) => fileName.endsWith('.sql'))
    .sort();
}

async function runPublicMigrations() {
  // Public migration block: creates system-level tables in public schema.
  const migrationsDir = path.join(__dirname, 'migrations', 'public');
  const files = getSqlFiles(migrationsDir);

  for (const fileName of files) {
    const sql = fs.readFileSync(path.join(migrationsDir, fileName), 'utf8');
    await query(sql);
  }
}

async function runTenantMigrations(client, schemaName) {
  // Tenant migration block: applies tenant table scripts under tenant search_path.
  const migrationsDir = path.join(__dirname, 'migrations', 'tenant');
  const files = getSqlFiles(migrationsDir);

  await client.query("SELECT set_config('search_path', $1, true)", [`${schemaName},public`]);

  for (const fileName of files) {
    const sql = fs.readFileSync(path.join(migrationsDir, fileName), 'utf8');
    await client.query(sql);
  }
}

module.exports = {
  runPublicMigrations,
  runTenantMigrations
};

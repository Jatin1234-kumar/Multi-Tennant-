// Demo seed script block: creates tenant/admin and sample project/task data for quick local testing.
const tenantService = require('../services/tenant.service');
const { query, withTenantTransaction, pool } = require('../config/db');
const { hashPassword } = require('../utils/password');

const demoConfig = {
  tenantName: process.env.DEMO_TENANT_NAME || 'Acme Labs',
  tenantSubdomain: (process.env.DEMO_TENANT_SUBDOMAIN || 'acme').toLowerCase(),
  adminEmail: (process.env.DEMO_ADMIN_EMAIL || 'admin@acme.com').toLowerCase(),
  adminPassword: process.env.DEMO_ADMIN_PASSWORD || 'Password@123'
};

// Helper block: gets existing tenant or creates one with initial admin user.
async function ensureTenant() {
  const existingTenant = await query(
    `SELECT id, name, schema_name AS "schemaName", subdomain
     FROM public.tenants
     WHERE subdomain = $1`,
    [demoConfig.tenantSubdomain]
  );

  if (existingTenant.rows[0]) {
    return existingTenant.rows[0];
  }

  const created = await tenantService.createTenant({
    name: demoConfig.tenantName,
    subdomain: demoConfig.tenantSubdomain,
    adminEmail: demoConfig.adminEmail,
    adminPassword: demoConfig.adminPassword
  });

  return created.tenant;
}

// Helper block: ensures admin user exists for the tenant.
async function ensureAdminUser(tenantId) {
  const existingAdmin = await query(
    `SELECT id, email
     FROM public.users
     WHERE tenant_id = $1 AND email = $2`,
    [tenantId, demoConfig.adminEmail]
  );

  if (existingAdmin.rows[0]) {
    return existingAdmin.rows[0];
  }

  const passwordHash = await hashPassword(demoConfig.adminPassword);
  const result = await query(
    `INSERT INTO public.users (email, password, tenant_id, role)
     VALUES ($1, $2, $3, 'Admin')
     RETURNING id, email`,
    [demoConfig.adminEmail, passwordHash, tenantId]
  );

  return result.rows[0];
}

// Helper block: creates project if missing by name.
async function ensureProject(client, name, description, createdBy) {
  const existing = await client.query(
    `SELECT id, name
     FROM projects
     WHERE name = $1
     LIMIT 1`,
    [name]
  );

  if (existing.rows[0]) {
    return existing.rows[0];
  }

  const inserted = await client.query(
    `INSERT INTO projects (name, description, created_by)
     VALUES ($1, $2, $3)
     RETURNING id, name`,
    [name, description, createdBy]
  );

  return inserted.rows[0];
}

// Helper block: creates task if missing by project + title.
async function ensureTask(client, title, status, projectId, assignedTo) {
  const existing = await client.query(
    `SELECT id, title
     FROM tasks
     WHERE project_id = $1 AND title = $2
     LIMIT 1`,
    [projectId, title]
  );

  if (existing.rows[0]) {
    return existing.rows[0];
  }

  const inserted = await client.query(
    `INSERT INTO tasks (title, status, project_id, assigned_to)
     VALUES ($1, $2, $3, $4)
     RETURNING id, title`,
    [title, status, projectId, assignedTo]
  );

  return inserted.rows[0];
}

// Main block: orchestrates full demo data creation.
async function run() {
  const tenant = await ensureTenant();
  const admin = await ensureAdminUser(tenant.id);

  await withTenantTransaction(tenant.schemaName, async (client) => {
    const websiteRevamp = await ensureProject(
      client,
      'Website Revamp',
      'Refresh landing and signup funnel',
      admin.id
    );

    const mobileLaunch = await ensureProject(
      client,
      'Mobile Launch',
      'Prepare initial Android and iOS rollout',
      admin.id
    );

    await ensureTask(client, 'Finalize hero copy', 'todo', websiteRevamp.id, admin.id);
    await ensureTask(client, 'Implement authentication flow', 'in_progress', websiteRevamp.id, admin.id);
    await ensureTask(client, 'Prepare app store assets', 'done', mobileLaunch.id, admin.id);
  });

  console.log('Demo seed completed successfully');
  console.log(`Tenant subdomain: ${tenant.subdomain}`);
  console.log(`Admin email: ${demoConfig.adminEmail}`);
  console.log(`Admin password: ${demoConfig.adminPassword}`);
}

run()
  .then(async () => {
    await pool.end();
    process.exit(0);
  })
  .catch(async (error) => {
    console.error('Demo seed failed:', error.message);
    await pool.end();
    process.exit(1);
  });

// User repository block: tenant-scoped system users in public schema.
const { query } = require('../config/db');

async function findByEmailAndTenant(email, tenantId) {
  // Login lookup block: fetches hash and role for auth.
  const result = await query(
    `SELECT id, email, password, tenant_id AS "tenantId", role, created_at AS "createdAt"
     FROM public.users
     WHERE email = $1 AND tenant_id = $2`,
    [email, tenantId]
  );

  return result.rows[0] || null;
}

async function createUser({ email, password, tenantId, role }) {
  const result = await query(
    `INSERT INTO public.users (email, password, tenant_id, role)
     VALUES ($1, $2, $3, $4)
     RETURNING id, email, tenant_id AS "tenantId", role, created_at AS "createdAt"`,
    [email, password, tenantId, role]
  );

  return result.rows[0];
}

async function findById(id) {
  const result = await query(
    `SELECT id, email, tenant_id AS "tenantId", role, created_at AS "createdAt"
     FROM public.users
     WHERE id = $1`,
    [id]
  );

  return result.rows[0] || null;
}

async function listByTenant(tenantId, page, pageSize) {
  const offset = (page - 1) * pageSize;

  const countResult = await query(
    `SELECT COUNT(*)::int AS total
     FROM public.users
     WHERE tenant_id = $1`,
    [tenantId]
  );

  const rowsResult = await query(
    `SELECT id, email, tenant_id AS "tenantId", role, created_at AS "createdAt"
     FROM public.users
     WHERE tenant_id = $1
     ORDER BY id DESC
     LIMIT $2 OFFSET $3`,
    [tenantId, pageSize, offset]
  );

  return {
    items: rowsResult.rows,
    total: countResult.rows[0]?.total || 0
  };
}

module.exports = {
  findByEmailAndTenant,
  createUser,
  findById,
  listByTenant
};

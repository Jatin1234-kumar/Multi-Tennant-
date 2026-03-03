// Invite repository block: SQL operations for workspace invite lifecycle.
const { query } = require('../config/db');

async function listPendingByTenant(tenantId, page, pageSize) {
  const offset = (page - 1) * pageSize;

  const countResult = await query(
    `SELECT COUNT(*)::int AS total
     FROM public.invites
     WHERE tenant_id = $1 AND accepted_at IS NULL AND expires_at > NOW()`,
    [tenantId]
  );

  const rowsResult = await query(
    `SELECT id, email, role, expires_at AS "expiresAt", created_at AS "createdAt"
     FROM public.invites
     WHERE tenant_id = $1 AND accepted_at IS NULL AND expires_at > NOW()
     ORDER BY id DESC
     LIMIT $2 OFFSET $3`,
    [tenantId, pageSize, offset]
  );

  return {
    items: rowsResult.rows,
    total: countResult.rows[0]?.total || 0
  };
}

async function findActiveByEmail(tenantId, email) {
  const result = await query(
    `SELECT id, email, role, tenant_id AS "tenantId", token_hash AS "tokenHash", expires_at AS "expiresAt"
     FROM public.invites
     WHERE tenant_id = $1
       AND email = $2
       AND accepted_at IS NULL
       AND expires_at > NOW()
     LIMIT 1`,
    [tenantId, email]
  );

  return result.rows[0] || null;
}

async function createInvite({ tenantId, email, role, tokenHash, createdBy, expiresAt }) {
  const result = await query(
    `INSERT INTO public.invites (tenant_id, email, role, token_hash, created_by, expires_at)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, email, role, expires_at AS "expiresAt", created_at AS "createdAt"`,
    [tenantId, email, role, tokenHash, createdBy, expiresAt]
  );

  return result.rows[0];
}

async function refreshInvite(inviteId, role, tokenHash, createdBy, expiresAt) {
  const result = await query(
    `UPDATE public.invites
     SET role = $2,
         token_hash = $3,
         created_by = $4,
         expires_at = $5,
         created_at = NOW()
     WHERE id = $1
     RETURNING id, email, role, expires_at AS "expiresAt", created_at AS "createdAt"`,
    [inviteId, role, tokenHash, createdBy, expiresAt]
  );

  return result.rows[0];
}

module.exports = {
  listPendingByTenant,
  findActiveByEmail,
  createInvite,
  refreshInvite
};

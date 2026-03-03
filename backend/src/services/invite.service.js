// Invite service block: creates invite links and accepts invites into active users.
const crypto = require('crypto');
const env = require('../config/env');
const { withTransaction } = require('../config/db');
const inviteRepository = require('../repositories/invite.repository');
const userRepository = require('../repositories/user.repository');
const tenantRepository = require('../repositories/tenant.repository');
const { hashPassword } = require('../utils/password');
const { signAccessToken } = require('../utils/jwt');
const { AppError } = require('../utils/errors');

function buildToken() {
  return crypto.randomBytes(32).toString('hex');
}

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function buildExpiryDate() {
  return new Date(Date.now() + env.inviteExpiryHours * 60 * 60 * 1000);
}

function buildInviteLink(token) {
  const base = env.frontendUrl.replace(/\/$/, '');
  return `${base}/?inviteToken=${encodeURIComponent(token)}`;
}

async function listInvites(tenant, query) {
  const page = query.page || 1;
  const pageSize = query.pageSize || 20;
  const result = await inviteRepository.listPendingByTenant(tenant.id, page, pageSize);

  return {
    ...result,
    page,
    pageSize
  };
}

async function createInvite(tenant, user, payload) {
  const email = payload.email.toLowerCase();

  const existingUser = await userRepository.findByEmailAndTenant(email, tenant.id);
  if (existingUser) {
    throw new AppError('User already exists in this workspace', 409);
  }

  const token = buildToken();
  const tokenHash = hashToken(token);
  const expiresAt = buildExpiryDate();

  const existingInvite = await inviteRepository.findActiveByEmail(tenant.id, email);

  const invite = existingInvite
    ? await inviteRepository.refreshInvite(existingInvite.id, payload.role || 'Member', tokenHash, user.id, expiresAt)
    : await inviteRepository.createInvite({
      tenantId: tenant.id,
      email,
      role: payload.role || 'Member',
      tokenHash,
      createdBy: user.id,
      expiresAt
    });

  return {
    invite,
    inviteLink: buildInviteLink(token)
  };
}

async function acceptInvite(payload) {
  const tokenHash = hashToken(payload.token);

  return withTransaction(async (client) => {
    const inviteResult = await client.query(
      `SELECT id, tenant_id AS "tenantId", email, role
       FROM public.invites
       WHERE token_hash = $1
         AND accepted_at IS NULL
         AND expires_at > NOW()
       LIMIT 1`,
      [tokenHash]
    );

    const invite = inviteResult.rows[0];

    if (!invite) {
      throw new AppError('Invalid or expired invite token', 400);
    }

    const existingUserResult = await client.query(
      `SELECT id
       FROM public.users
       WHERE tenant_id = $1 AND email = $2
       LIMIT 1`,
      [invite.tenantId, invite.email]
    );

    if (existingUserResult.rows[0]) {
      throw new AppError('User already exists for this invite', 409);
    }

    const passwordHash = await hashPassword(payload.password);

    const userResult = await client.query(
      `INSERT INTO public.users (email, password, tenant_id, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, tenant_id AS "tenantId", role`,
      [invite.email, passwordHash, invite.tenantId, invite.role]
    );

    await client.query(
      `UPDATE public.invites
       SET accepted_at = NOW()
       WHERE id = $1`,
      [invite.id]
    );

    const tenant = await tenantRepository.findById(invite.tenantId);

    const createdUser = userResult.rows[0];
    const accessToken = signAccessToken({
      userId: createdUser.id,
      tenantId: createdUser.tenantId,
      role: createdUser.role,
      email: createdUser.email
    });

    return {
      accessToken,
      tenant,
      user: createdUser
    };
  });
}

module.exports = {
  listInvites,
  createInvite,
  acceptInvite
};

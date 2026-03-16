// Auth service block: verifies credentials and issues JWT token.
const { OAuth2Client } = require('google-auth-library');
const env = require('../config/env');
const userRepository = require('../repositories/user.repository');
const { comparePassword } = require('../utils/password');
const { signAccessToken } = require('../utils/jwt');
const { AppError } = require('../utils/errors');

const googleClient = new OAuth2Client();

function buildAuthPayload(user) {
  return {
    accessToken: signAccessToken({
      userId: user.id,
      tenantId: user.tenantId,
      role: user.role,
      email: user.email
    }),
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId
    }
  };
}

async function login({ email, password, tenant }) {
  // User lookup block: scoped by tenant id to avoid cross-tenant login.
  const user = await userRepository.findByEmailAndTenant(email, tenant.id);

  if (!user) {
    throw new AppError('Invalid credentials', 401);
  }

  // Password verification block: compares plain password with bcrypt hash.
  const isPasswordCorrect = await comparePassword(password, user.password);

  if (!isPasswordCorrect) {
    throw new AppError('Invalid credentials', 401);
  }

  return buildAuthPayload(user);
}

async function loginWithGoogle({ idToken, tenant }) {
  if (!env.googleClientId) {
    throw new AppError('Google login is not configured on server', 500);
  }

  let ticket;

  try {
    ticket = await googleClient.verifyIdToken({
      idToken,
      audience: env.googleClientId
    });
  } catch (_error) {
    throw new AppError('Invalid Google token', 401);
  }

  const payload = ticket.getPayload() || {};
  const normalizedEmail = String(payload.email || '').trim().toLowerCase();

  if (!normalizedEmail || !payload.email_verified) {
    throw new AppError('Google account email is not verified', 401);
  }

  const user = await userRepository.findByEmailAndTenant(normalizedEmail, tenant.id);

  if (!user) {
    throw new AppError('No account found in this workspace for Google email', 403);
  }

  return buildAuthPayload(user);
}

module.exports = {
  login,
  loginWithGoogle
};

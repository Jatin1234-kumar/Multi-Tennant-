// Auth service block: verifies credentials and issues JWT token.
const userRepository = require('../repositories/user.repository');
const { comparePassword } = require('../utils/password');
const { signAccessToken } = require('../utils/jwt');
const { AppError } = require('../utils/errors');

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

  // Token creation block: embeds user + tenant claims.
  const accessToken = signAccessToken({
    userId: user.id,
    tenantId: user.tenantId,
    role: user.role,
    email: user.email
  });

  return {
    accessToken,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId
    }
  };
}

module.exports = {
  login
};

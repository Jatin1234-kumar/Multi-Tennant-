// User service block: tenant-scoped team management operations.
const userRepository = require('../repositories/user.repository');
const { hashPassword } = require('../utils/password');
const { AppError } = require('../utils/errors');

async function listUsers(tenant, query) {
  const page = query.page || 1;
  const pageSize = query.pageSize || 20;
  const result = await userRepository.listByTenant(tenant.id, page, pageSize);

  return {
    ...result,
    page,
    pageSize
  };
}

async function createUser(tenant, payload) {
  const existing = await userRepository.findByEmailAndTenant(payload.email.toLowerCase(), tenant.id);

  if (existing) {
    throw new AppError('User already exists in this tenant', 409);
  }

  const passwordHash = await hashPassword(payload.password);

  return userRepository.createUser({
    email: payload.email.toLowerCase(),
    password: passwordHash,
    tenantId: tenant.id,
    role: payload.role || 'Member'
  });
}

module.exports = {
  listUsers,
  createUser
};

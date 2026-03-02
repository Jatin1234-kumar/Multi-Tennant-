// Onboarding service block: creates tenant workspace and returns ready login token.
const tenantService = require('./tenant.service');
const { signAccessToken } = require('../utils/jwt');

async function registerWorkspace(payload) {
  const result = await tenantService.createTenant(payload);

  const accessToken = signAccessToken({
    userId: result.admin.id,
    tenantId: result.admin.tenantId,
    role: result.admin.role,
    email: result.admin.email
  });

  return {
    tenant: result.tenant,
    user: result.admin,
    accessToken
  };
}

module.exports = {
  registerWorkspace
};

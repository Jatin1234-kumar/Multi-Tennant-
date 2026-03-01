// Project service block: tenant-scoped project business operations.
const { withTenantTransaction } = require('../config/db');
const projectRepository = require('../repositories/project.repository');

async function listProjects(tenant, _user) {
  // Read block: uses tenant search_path so only that tenant schema is queried.
  return withTenantTransaction(tenant.schemaName, async (client) => {
    return projectRepository.listProjects(client);
  });
}

async function createProject(tenant, user, payload) {
  // Create block: records creator from authenticated user id.
  return withTenantTransaction(tenant.schemaName, async (client) => {
    return projectRepository.createProject(client, {
      name: payload.name,
      description: payload.description || null,
      createdBy: user.id
    });
  });
}

module.exports = {
  listProjects,
  createProject
};

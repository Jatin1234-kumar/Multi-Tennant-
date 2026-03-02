// Project service block: tenant-scoped project business operations.
const { withTenantTransaction } = require('../config/db');
const projectRepository = require('../repositories/project.repository');
const { AppError } = require('../utils/errors');

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

async function deleteProject(tenant, projectId) {
  return withTenantTransaction(tenant.schemaName, async (client) => {
    const deleted = await projectRepository.deleteProject(client, projectId);

    if (!deleted) {
      throw new AppError('Project not found', 404);
    }

    return deleted;
  });
}

module.exports = {
  listProjects,
  createProject,
  deleteProject
};

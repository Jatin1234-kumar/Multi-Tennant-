// Task service block: tenant-scoped task operations.
const { withTenantTransaction } = require('../config/db');
const taskRepository = require('../repositories/task.repository');

async function listTasks(tenant, query) {
  // List block: optionally filters by projectId when query param is provided.
  return withTenantTransaction(tenant.schemaName, async (client) => {
    return taskRepository.listTasks(client, query.projectId || null);
  });
}

async function createTask(tenant, payload) {
  // Create block: writes task into current tenant schema.
  return withTenantTransaction(tenant.schemaName, async (client) => {
    return taskRepository.createTask(client, {
      title: payload.title,
      status: payload.status || 'todo',
      projectId: payload.projectId,
      assignedTo: payload.assignedTo || null
    });
  });
}

module.exports = {
  listTasks,
  createTask
};

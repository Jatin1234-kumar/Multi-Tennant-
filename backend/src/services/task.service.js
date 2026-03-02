// Task service block: tenant-scoped task operations.
const { withTenantTransaction } = require('../config/db');
const taskRepository = require('../repositories/task.repository');
const { AppError } = require('../utils/errors');

async function listTasks(tenant, query) {
  // List block: optionally filters by projectId when query param is provided.
  return withTenantTransaction(tenant.schemaName, async (client) => {
    const page = query.page || 1;
    const pageSize = query.pageSize || 20;
    const result = await taskRepository.listTasks(client, query.projectId || null, page, pageSize);

    return {
      ...result,
      page,
      pageSize
    };
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

async function updateTaskStatus(tenant, taskId, status) {
  return withTenantTransaction(tenant.schemaName, async (client) => {
    const updated = await taskRepository.updateTaskStatus(client, taskId, status);

    if (!updated) {
      throw new AppError('Task not found', 404);
    }

    return updated;
  });
}

async function deleteTask(tenant, taskId) {
  return withTenantTransaction(tenant.schemaName, async (client) => {
    const deleted = await taskRepository.deleteTask(client, taskId);

    if (!deleted) {
      throw new AppError('Task not found', 404);
    }

    return deleted;
  });
}

module.exports = {
  listTasks,
  createTask,
  updateTaskStatus,
  deleteTask
};

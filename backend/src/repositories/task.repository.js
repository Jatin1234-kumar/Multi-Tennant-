// Task repository block: SQL only for task table operations.
async function listTasks(client, projectId) {
  const params = [];
  let whereClause = '';

  // Dynamic filter block: applies optional project-based filtering.
  if (projectId) {
    params.push(projectId);
    whereClause = 'WHERE project_id = $1';
  }

  const result = await client.query(
    `SELECT id, title, status, project_id AS "projectId", assigned_to AS "assignedTo", created_at AS "createdAt"
     FROM tasks
     ${whereClause}
     ORDER BY id DESC`,
    params
  );

  return result.rows;
}

async function createTask(client, { title, status, projectId, assignedTo }) {
  // Insert block: writes task with optional assignee.
  const result = await client.query(
    `INSERT INTO tasks (title, status, project_id, assigned_to)
     VALUES ($1, $2, $3, $4)
     RETURNING id, title, status, project_id AS "projectId", assigned_to AS "assignedTo", created_at AS "createdAt"`,
    [title, status, projectId, assignedTo || null]
  );

  return result.rows[0];
}

async function updateTaskStatus(client, taskId, status) {
  const result = await client.query(
    `UPDATE tasks
     SET status = $2
     WHERE id = $1
     RETURNING id, title, status, project_id AS "projectId", assigned_to AS "assignedTo", created_at AS "createdAt"`,
    [taskId, status]
  );

  return result.rows[0] || null;
}

async function deleteTask(client, taskId) {
  const result = await client.query(
    `DELETE FROM tasks
     WHERE id = $1
     RETURNING id, title, status, project_id AS "projectId", assigned_to AS "assignedTo", created_at AS "createdAt"`,
    [taskId]
  );

  return result.rows[0] || null;
}

module.exports = {
  listTasks,
  createTask,
  updateTaskStatus,
  deleteTask
};

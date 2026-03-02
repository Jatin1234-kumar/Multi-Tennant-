// Task repository block: SQL only for task table operations.
async function listTasks(client, projectId, page, pageSize) {
  const params = [];
  const where = [];

  // Dynamic filter block: applies optional project-based filtering.
  if (projectId) {
    params.push(projectId);
    where.push(`project_id = $${params.length}`);
  }

  const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const countResult = await client.query(
    `SELECT COUNT(*)::int AS total
     FROM tasks
     ${whereClause}`,
    params
  );

  const total = countResult.rows[0]?.total || 0;

  const offset = (page - 1) * pageSize;
  params.push(pageSize);
  params.push(offset);

  const limitPlaceholder = `$${params.length - 1}`;
  const offsetPlaceholder = `$${params.length}`;

  const result = await client.query(
    `SELECT id, title, status, project_id AS "projectId", assigned_to AS "assignedTo", created_at AS "createdAt"
     FROM tasks
     ${whereClause}
     ORDER BY id DESC
     LIMIT ${limitPlaceholder} OFFSET ${offsetPlaceholder}`,
    params
  );

  return {
    items: result.rows,
    total
  };
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

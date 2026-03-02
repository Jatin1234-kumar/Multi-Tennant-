// Project repository block: SQL only for project table operations.
async function listProjects(client) {
  const result = await client.query(
    `SELECT id, name, description, created_by AS "createdBy", created_at AS "createdAt"
     FROM projects
     ORDER BY id DESC`
  );

  return result.rows;
}

async function createProject(client, { name, description, createdBy }) {
  // Insert block: stores project metadata and creator id.
  const result = await client.query(
    `INSERT INTO projects (name, description, created_by)
     VALUES ($1, $2, $3)
     RETURNING id, name, description, created_by AS "createdBy", created_at AS "createdAt"`,
    [name, description, createdBy]
  );

  return result.rows[0];
}

async function deleteProject(client, projectId) {
  const result = await client.query(
    `DELETE FROM projects
     WHERE id = $1
     RETURNING id, name, description, created_by AS "createdBy", created_at AS "createdAt"`,
    [projectId]
  );

  return result.rows[0] || null;
}

module.exports = {
  listProjects,
  createProject,
  deleteProject
};

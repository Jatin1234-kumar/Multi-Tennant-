CREATE TABLE IF NOT EXISTS tasks (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'done')),
  project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  assigned_to BIGINT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

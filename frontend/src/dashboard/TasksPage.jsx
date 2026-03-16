import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../services/api';

export default function TasksPage() {
  const { token, subdomain } = useAuth();
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ page: 1, total: 0, totalPages: 1, pageSize: 20 });

  async function load() {
    const result = await apiRequest({
      path: `/tasks?page=${meta.page}&pageSize=${meta.pageSize}`,
      token,
      subdomain
    });
    setItems(result.data || []);
    setMeta(result.pagination || meta);
  }

  useEffect(() => {
    load().catch(() => setItems([]));
  }, []);

  async function handleCreate(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    await apiRequest({
      path: '/tasks',
      method: 'POST',
      token,
      subdomain,
      body: {
        title: String(formData.get('title') || '').trim(),
        projectId: Number(formData.get('projectId')),
        status: String(formData.get('status') || 'todo')
      }
    });
    event.currentTarget.reset();
    await load();
  }

  async function updateStatus(taskId, status) {
    await apiRequest({
      path: `/tasks/${taskId}/status`,
      method: 'PATCH',
      token,
      subdomain,
      body: { status }
    });
    await load();
  }

  async function handleDelete(taskId) {
    await apiRequest({ path: `/tasks/${taskId}`, method: 'DELETE', token, subdomain });
    await load();
  }

  return (
    <section className="tab-panel">
      <h2>TASKS</h2>
      <form className="form-grid" onSubmit={handleCreate}>
        <input name="title" placeholder="TASK TITLE" required />
        <input name="projectId" type="number" placeholder="PROJECT ID" required />
        <select name="status" aria-label="Task status">
          <option value="todo">TODO</option>
          <option value="in_progress">IN_PROGRESS</option>
          <option value="done">DONE</option>
        </select>
        <button type="submit">CREATE TASK</button>
      </form>
      <p className="list-meta">Page {meta.page} / {meta.totalPages || 1} (Total: {meta.total})</p>
      <div className="list-wrap">
        {items.length === 0 && <p className="list-meta">No tasks yet.</p>}
        {items.map((item) => (
          <article className="list-item" key={item.id}>
            <strong>#{item.id} {item.title}</strong>
            <div className="list-meta">Status: {item.status} | Project: {item.projectId}</div>
            <div className="list-actions">
              <button type="button" onClick={() => updateStatus(item.id, 'todo')}>TODO</button>
              <button type="button" onClick={() => updateStatus(item.id, 'in_progress')}>IN_PROGRESS</button>
              <button type="button" onClick={() => updateStatus(item.id, 'done')}>DONE</button>
              <button type="button" onClick={() => handleDelete(item.id)}>DELETE</button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

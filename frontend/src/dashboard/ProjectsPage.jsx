import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../services/api';

export default function ProjectsPage() {
  const { token, subdomain } = useAuth();
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ page: 1, total: 0, totalPages: 1, pageSize: 20 });

  async function load() {
    const result = await apiRequest({
      path: `/projects?page=${meta.page}&pageSize=${meta.pageSize}`,
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
    const name = String(formData.get('name') || '').trim();
    const description = String(formData.get('description') || '').trim();
    await apiRequest({ path: '/projects', method: 'POST', body: { name, description }, token, subdomain });
    event.currentTarget.reset();
    await load();
  }

  async function handleDelete(projectId) {
    await apiRequest({ path: `/projects/${projectId}`, method: 'DELETE', token, subdomain });
    await load();
  }

  return (
    <section className="tab-panel">
      <h2>PROJECTS</h2>
      <form className="form-grid" onSubmit={handleCreate}>
        <input name="name" placeholder="PROJECT NAME" required />
        <input name="description" placeholder="DESCRIPTION" />
        <button type="submit">CREATE PROJECT</button>
      </form>
      <p className="list-meta">Page {meta.page} / {meta.totalPages || 1} (Total: {meta.total})</p>
      <div className="list-wrap">
        {items.length === 0 && <p className="list-meta">No projects yet.</p>}
        {items.map((item) => (
          <article className="list-item" key={item.id}>
            <strong>#{item.id} {item.name}</strong>
            <div className="list-meta">{item.description || 'No description'}</div>
            <div className="list-actions">
              <button type="button" onClick={() => handleDelete(item.id)}>DELETE</button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

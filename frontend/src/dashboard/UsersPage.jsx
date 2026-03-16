import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../services/api';

export default function UsersPage() {
  const { token, subdomain } = useAuth();
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ page: 1, total: 0, totalPages: 1, pageSize: 20 });

  async function load() {
    const result = await apiRequest({
      path: `/users?page=${meta.page}&pageSize=${meta.pageSize}`,
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
      path: '/users',
      method: 'POST',
      token,
      subdomain,
      body: {
        email: String(formData.get('email') || '').trim().toLowerCase(),
        password: String(formData.get('password') || ''),
        role: String(formData.get('role') || 'Member')
      }
    });
    event.currentTarget.reset();
    await load();
  }

  return (
    <section className="tab-panel">
      <h2>TEAM USERS</h2>
      <form className="form-grid" onSubmit={handleCreate}>
        <input name="email" type="email" placeholder="USER EMAIL" required />
        <input name="password" type="password" placeholder="TEMP PASSWORD" required />
        <select name="role" aria-label="User role">
          <option value="Member">MEMBER</option>
          <option value="Admin">ADMIN</option>
        </select>
        <button type="submit">ADD USER</button>
      </form>
      <p className="list-meta">Page {meta.page} / {meta.totalPages || 1} (Total: {meta.total})</p>
      <div className="list-wrap">
        {items.length === 0 && <p className="list-meta">No users yet.</p>}
        {items.map((item) => (
          <article className="list-item" key={item.id}>
            <strong>#{item.id} {item.email}</strong>
            <div className="list-meta">Role: {item.role}</div>
          </article>
        ))}
      </div>
    </section>
  );
}

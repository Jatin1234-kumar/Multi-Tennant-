import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../services/api';

export default function InvitesPage() {
  const { token, subdomain } = useAuth();
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ page: 1, total: 0, totalPages: 1, pageSize: 20 });
  const [inviteLink, setInviteLink] = useState('Invite link will appear here after creation.');

  async function load() {
    const result = await apiRequest({
      path: `/invites?page=${meta.page}&pageSize=${meta.pageSize}`,
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
    const result = await apiRequest({
      path: '/invites',
      method: 'POST',
      token,
      subdomain,
      body: {
        email: String(formData.get('email') || '').trim().toLowerCase(),
        role: String(formData.get('role') || 'Member')
      }
    });

    setInviteLink(result.inviteLink);
    event.currentTarget.reset();
    await load();
  }

  return (
    <section className="tab-panel">
      <h2>INVITES</h2>
      <form className="form-grid" onSubmit={handleCreate}>
        <input name="email" type="email" placeholder="INVITE EMAIL" required />
        <select name="role" aria-label="Invite role">
          <option value="Member">MEMBER</option>
          <option value="Admin">ADMIN</option>
        </select>
        <button type="submit">SEND INVITE</button>
      </form>
      <p className="status-text">{inviteLink}</p>
      <p className="list-meta">Page {meta.page} / {meta.totalPages || 1} (Total: {meta.total})</p>
      <div className="list-wrap">
        {items.length === 0 && <p className="list-meta">No pending invites.</p>}
        {items.map((item) => (
          <article className="list-item" key={item.id}>
            <strong>#{item.id} {item.email}</strong>
            <div className="list-meta">Role: {item.role} | Expires: {new Date(item.expiresAt).toLocaleString()}</div>
          </article>
        ))}
      </div>
    </section>
  );
}

import { useAuth } from '../context/AuthContext';

export default function SettingsPage() {
  const { subdomain } = useAuth();

  return (
    <section className="tab-panel">
      <h2>SETTINGS</h2>
      <div className="list-wrap">
        <article className="list-item">
          <strong>Workspace</strong>
          <div className="list-meta">Tenant subdomain: {subdomain}</div>
        </article>
        <article className="list-item">
          <strong>Security</strong>
          <div className="list-meta">JWT + tenant-scoped middleware enforced on backend.</div>
        </article>
      </div>
    </section>
  );
}

import AuthForms from '../auth/AuthForms';

export default function AuthPage() {
  return (
    <div className="app-view is-ready">
      <section className="app-shell fade-up-target">
        <header className="app-header">
          <h1 className="app-title">TENANT PROJECT MANAGER</h1>
        </header>
        <AuthForms />
      </section>
    </div>
  );
}

import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AppLayout() {
  const { isAuthenticated, clearSession } = useAuth();
  const navigate = useNavigate();

  function navClass({ isActive }) {
    return `tab-btn ${isActive ? 'active' : ''}`;
  }

  function handleLogout() {
    clearSession();
    navigate('/auth/login');
  }

  return (
    <div className="app-view is-ready">
      <section className="app-shell fade-up-target">
        <header className="app-header">
          <h1 className="app-title">TENANT PROJECT MANAGER</h1>
          <nav className="tab-row">
            <NavLink to="/dashboard/projects" className={navClass}>PROJECTS</NavLink>
            <NavLink to="/dashboard/tasks" className={navClass}>TASKS</NavLink>
            <NavLink to="/dashboard/users" className={navClass}>USERS</NavLink>
            <NavLink to="/dashboard/invites" className={navClass}>INVITES</NavLink>
            <NavLink to="/billing" className={navClass}>BILLING</NavLink>
            <NavLink to="/settings" className={navClass}>SETTINGS</NavLink>
            {!isAuthenticated ? (
              <Link to="/auth/login" className="ghost-btn">LOGIN</Link>
            ) : (
              <button type="button" className="ghost-btn" onClick={handleLogout}>LOGOUT</button>
            )}
          </nav>
        </header>
        <Outlet />
      </section>
    </div>
  );
}

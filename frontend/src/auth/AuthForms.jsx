import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiRequest, getInviteTokenFromUrl } from '../services/api';
import GoogleLoginButton from './GoogleLoginButton';

export default function AuthForms() {
  const { mode } = useParams();
  const navigate = useNavigate();
  const { setSession } = useAuth();
  const [status, setStatus] = useState('Not logged in');
  const [loginSubdomain, setLoginSubdomain] = useState('');

  async function handleLogin(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const subdomain = String(formData.get('subdomain') || '').trim().toLowerCase();
    const email = String(formData.get('email') || '').trim().toLowerCase();
    const password = String(formData.get('password') || '');

    try {
      const result = await apiRequest({
        path: '/auth/login',
        method: 'POST',
        body: { email, password },
        subdomain
      });
      setSession(result.accessToken, subdomain);
      navigate('/dashboard/projects');
    } catch (error) {
      setStatus(error.message);
    }
  }

  async function handleGoogleCredential(idToken) {
    const subdomain = loginSubdomain.trim().toLowerCase();

    if (!subdomain) {
      setStatus('Enter tenant subdomain before using Google login');
      return;
    }

    try {
      setStatus('Signing in with Google...');
      const result = await apiRequest({
        path: '/auth/google',
        method: 'POST',
        body: { idToken },
        subdomain
      });
      setSession(result.accessToken, subdomain);
      navigate('/dashboard/projects');
    } catch (error) {
      setStatus(error.message);
    }
  }

  async function handleRegister(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    const payload = {
      name: String(formData.get('name') || '').trim(),
      subdomain: String(formData.get('subdomain') || '').trim().toLowerCase(),
      adminEmail: String(formData.get('adminEmail') || '').trim().toLowerCase(),
      adminPassword: String(formData.get('adminPassword') || '')
    };

    try {
      const result = await apiRequest({
        path: '/onboarding/register-workspace',
        method: 'POST',
        body: payload,
        includeTenantHeader: false
      });
      setSession(result.accessToken, result.tenant.subdomain);
      navigate('/dashboard/projects');
    } catch (error) {
      setStatus(error.message);
    }
  }

  async function handleAccept(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const token = String(formData.get('token') || '');
    const password = String(formData.get('password') || '');

    try {
      const result = await apiRequest({
        path: '/invites/accept',
        method: 'POST',
        body: { token, password },
        includeTenantHeader: false
      });
      setSession(result.accessToken, result.tenant.subdomain);
      navigate('/dashboard/projects');
    } catch (error) {
      setStatus(error.message);
    }
  }

  return (
    <section className="auth-panel">
      <h2>AUTHENTICATION</h2>
      <nav className="tab-row auth-tabs">
        <button type="button" className={`tab-btn ${mode === 'login' ? 'active' : ''}`} onClick={() => navigate('/auth/login')}>LOGIN</button>
        <button type="button" className={`tab-btn ${mode === 'register' ? 'active' : ''}`} onClick={() => navigate('/auth/register')}>CREATE WORKSPACE</button>
        <button type="button" className={`tab-btn ${mode === 'accept' ? 'active' : ''}`} onClick={() => navigate('/auth/accept')}>ACCEPT INVITE</button>
      </nav>

      {mode === 'register' && (
        <form className="form-grid auth-form" onSubmit={handleRegister}>
          <input name="name" placeholder="WORKSPACE NAME" required />
          <input name="subdomain" placeholder="SUBDOMAIN" required />
          <input name="adminEmail" type="email" placeholder="ADMIN EMAIL" required />
          <input name="adminPassword" type="password" placeholder="ADMIN PASSWORD" required />
          <button type="submit">CREATE & LOGIN</button>
        </form>
      )}

      {mode === 'accept' && (
        <form className="form-grid auth-form" onSubmit={handleAccept}>
          <input name="token" defaultValue={getInviteTokenFromUrl() || ''} placeholder="INVITE TOKEN" required />
          <input name="password" type="password" placeholder="SET PASSWORD" required />
          <button type="submit">ACCEPT INVITE</button>
        </form>
      )}

      {mode !== 'register' && mode !== 'accept' && (
        <>
          <form className="form-grid auth-form" onSubmit={handleLogin}>
            <input
              name="subdomain"
              placeholder="TENANT SUBDOMAIN"
              value={loginSubdomain}
              onChange={(event) => setLoginSubdomain(event.target.value)}
              required
            />
            <input name="email" type="email" placeholder="EMAIL" required />
            <input name="password" type="password" placeholder="PASSWORD" required />
            <button type="submit">LOGIN</button>
          </form>
          <div className="oauth-wrap">
            <GoogleLoginButton
              onCredential={handleGoogleCredential}
              onError={setStatus}
            />
          </div>
        </>
      )}

      <p className="status-text">{status}</p>
    </section>
  );
}

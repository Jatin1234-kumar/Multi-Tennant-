import { createContext, useContext, useMemo, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setTokenState] = useState(localStorage.getItem('token') || '');
  const [subdomain, setSubdomainState] = useState(localStorage.getItem('subdomain') || '');

  function setSession(nextToken, nextSubdomain) {
    setTokenState(nextToken);
    setSubdomainState(nextSubdomain);
    localStorage.setItem('token', nextToken);
    localStorage.setItem('subdomain', nextSubdomain);
  }

  function clearSession() {
    setTokenState('');
    setSubdomainState('');
    localStorage.removeItem('token');
    localStorage.removeItem('subdomain');
  }

  const value = useMemo(
    () => ({ token, subdomain, setSession, clearSession, isAuthenticated: Boolean(token && subdomain) }),
    [token, subdomain]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return ctx;
}

const API_BASE = 'http://localhost:4000/api/v1';

export function getInviteTokenFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('inviteToken');
}

export async function apiRequest({ path, method = 'GET', body, token, subdomain, includeTenantHeader = true }) {
  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(includeTenantHeader && subdomain ? { 'x-tenant-subdomain': subdomain } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.message || 'Request failed');
  }

  return payload;
}

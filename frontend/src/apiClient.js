const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

export async function apiGet(path, requireAuth = false) {
  const jwt = localStorage.getItem('jwt');
  const headers = { 'Content-Type': 'application/json' };
  if (requireAuth && jwt) headers['Authorization'] = `Bearer ${jwt}`;
  const res = await fetch(`${API_BASE}${path}`, { headers });
  if (res.status === 401) {
    const err = new Error(`GET ${path} unauthorized`);
    err.status = 401;
    throw err;
  }
  if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`);
  return res.json();
}

export async function apiPost(path, body, requireAuth = true) {
  const jwt = localStorage.getItem('jwt');
  const headers = { 'Content-Type': 'application/json' };
  if (requireAuth && jwt) headers['Authorization'] = `Bearer ${jwt}`;
  const res = await fetch(`${API_BASE}${path}`, { method: 'POST', headers, body: JSON.stringify(body) });
  if (res.status === 401) {
    const err = new Error(`POST ${path} unauthorized`);
    err.status = 401;
    throw err;
  }
  if (!res.ok) throw new Error(`POST ${path} failed: ${res.status}`);
  return res.json();
}

export async function loginWithEmail(email, password) {
  // Backend expects username; pass email as username for now
  const username = typeof email === 'string' && email.includes('@') ? email.split('@')[0] : email;
  const data = await apiPost('/api/auth/login', { username, password }, false);
  if (data?.token) {
    localStorage.setItem('jwt', data.token);
    if (data.user) localStorage.setItem('user', JSON.stringify(data.user));
  }
  return data;
}

// Convenience wrappers that automatically use stored JWT when requireAuth=true
export const authGet = (path) => apiGet(path, true);
export const authPost = (path, body) => apiPost(path, body, true);

// Provide a small utility to wrap calls and react to 401s
export function withUnauthorizedHandler(onUnauthorized) {
  return {
    get: async (path) => {
      try { return await authGet(path); } catch (e) { if (e.status === 401) onUnauthorized?.(e); throw e; }
    },
    post: async (path, body) => {
      try { return await authPost(path, body); } catch (e) { if (e.status === 401) onUnauthorized?.(e); throw e; }
    },
  };
}

export { API_BASE };

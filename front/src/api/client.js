const API = import.meta.env.VITE_API_URL || '/api';

let _accessToken = null;
let _onUnauthorized = null;

export function setAccessToken(token) {
  _accessToken = token;
}

export function getAccessToken() {
  return _accessToken;
}

export function setUnauthorizedHandler(fn) {
  _onUnauthorized = fn;
}

async function request(path, options = {}, retry = true) {
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (_accessToken) headers['Authorization'] = `Bearer ${_accessToken}`;

  const res = await fetch(`${API}${path}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  if (res.status === 401 && retry) {
    const data = await tryRefreshFull();
    if (data) {
      setAccessToken(data.access_token);
      return request(path, options, false);
    } else {
      _onUnauthorized?.();
      throw new Error('Unauthorized');
    }
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || 'Request failed');
  }

  if (res.status === 204) return null;
  return res.json();
}

async function tryRefreshFull() {
  try {
    const res = await fetch(`${API}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export const api = {
  get: (path) => request(path, { method: 'GET' }),
  post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) }),
  put: (path, body) => request(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (path) => request(path, { method: 'DELETE' }),
};

export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
  refreshFull: () => tryRefreshFull(),
};
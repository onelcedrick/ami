// -*- coding: utf-8 -*-
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

async function request(endpoint: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...(options.headers as Record<string, string> || {}),
  };

  const res = await fetch(`${API_URL}${endpoint}`, { ...options, headers });

  if (res.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
    throw new Error('Session expiree');
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Erreur' }));
    throw new Error(error.error || error.detail || `Erreur ${res.status}`);
  }

  return res.json();
}

const api = {
  get: (endpoint: string) => request(endpoint),
  post: (endpoint: string, data?: any) => request(endpoint, { method: 'POST', body: JSON.stringify(data) }),
  put: (endpoint: string, data?: any) => request(endpoint, { method: 'PUT', body: JSON.stringify(data) }),
  patch: (endpoint: string, data?: any) => request(endpoint, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (endpoint: string) => request(endpoint, { method: 'DELETE' }),
};

export default api;

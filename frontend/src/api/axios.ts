// -*- coding: utf-8 -*-
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

async function request(endpoint: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;

  const headers: Record<string, string> = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token && { Authorization: `Bearer ${token}` }),
    ...(options.headers as Record<string, string> || {}),
  };

  // Let the browser set the multipart boundary itself.
  if (isFormData) {
    delete headers['Content-Type'];
  }

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

function toBody(data?: any) {
  if (data === undefined) return undefined;
  if (typeof FormData !== 'undefined' && data instanceof FormData) return data;
  return JSON.stringify(data);
}

const api = {
  get: (endpoint: string, options: RequestInit = {}) => request(endpoint, options),
  post: (endpoint: string, data?: any, options: RequestInit = {}) =>
    request(endpoint, { ...options, method: 'POST', body: toBody(data) }),
  put: (endpoint: string, data?: any, options: RequestInit = {}) =>
    request(endpoint, { ...options, method: 'PUT', body: toBody(data) }),
  patch: (endpoint: string, data?: any, options: RequestInit = {}) =>
    request(endpoint, { ...options, method: 'PATCH', body: toBody(data) }),
  delete: (endpoint: string, options: RequestInit = {}) =>
    request(endpoint, { ...options, method: 'DELETE' }),
};

export default api;

// -*- coding: utf-8 -*-
const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

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

  // Normalize endpoint URL
  let cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  if (!cleanEndpoint.startsWith('/api/v1') && !cleanEndpoint.startsWith('/api/')) {
    cleanEndpoint = `/api/v1${cleanEndpoint}`;
  }

  const base = API_URL ? API_URL.replace(/\/+$/, '') : '';
  const url = `${base}${cleanEndpoint}`;

  try {
    const res = await fetch(url, { ...options, headers });

    if (res.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
      throw new Error('Session expirée');
    }

    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: `Erreur ${res.status}` }));
      throw new Error(error.error || error.detail || error.message || `Erreur ${res.status}`);
    }

    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      return await res.json();
    }
    return await res.text();
  } catch (err: any) {
    // If it's an aborted or connection error, provide clean message
    if (err.name === 'TypeError' && err.message?.includes('fetch')) {
      console.warn(`[API Network Error on ${cleanEndpoint}]:`, err.message);
      // If fetching client-side relative fails, retry once with relative origin
      if (typeof window !== 'undefined' && base) {
        try {
          const fallbackRes = await fetch(cleanEndpoint, { ...options, headers });
          if (fallbackRes.ok) return await fallbackRes.json();
        } catch {}
      }
    }
    throw err;
  }
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

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

let authToken: string | null = null;

export const setToken = (token: string | null) => {
  authToken = token;
  if (typeof window !== 'undefined') {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }
};

export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return authToken || localStorage.getItem('token');
};

async function request(endpoint: string, options: RequestInit = {}) {
  const token = getToken();
  const headers: Record<string, string> = {};

  // Ajouter Content-Type seulement pour les requêtes avec body
  if (options.body) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  console.log(`📡 Requête: ${options.method || 'GET'} ${endpoint}`, token ? '(auth)' : '(public)');

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: { ...headers, ...options.headers },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Erreur inconnue' }));
    console.error(`❌ Erreur ${res.status}:`, error);
    throw new Error(error.error || 'Une erreur est survenue');
  }

  const data = await res.json();
  console.log(`✅ Réponse:`, data);
  return data;
}

// Auth
export const login = (email: string, password: string) =>
  request('/api/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

export const register = (data: { email: string; password: string; first_name: string; last_name: string }) =>
  request('/api/v1/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });

// Products
export const getProducts = (params?: Record<string, string>) => {
  const query = params ? `?${new URLSearchParams(params)}` : '';
  return request(`/api/v1/products${query}`);
};

export const getCategories = () =>
  request('/api/v1/categories');

// Cart
export const getCart = () =>
  request('/api/v1/cart');

export const addToCart = (productId: string, quantity: number = 1) =>
  request('/api/v1/cart/items', {
    method: 'POST',
    body: JSON.stringify({ product_id: productId, quantity }),
  });

// Orders
export const createOrder = (shippingAddress: string) =>
  request('/api/v1/orders', {
    method: 'POST',
    body: JSON.stringify({ shipping_address: shippingAddress, payment_method: 'card' }),
  });

export const getOrders = () =>
  request('/api/v1/orders');

// Tickets
export const createTicket = (data: { subject: string; description: string; priority?: string }) =>
  request('/api/v1/tickets', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const getTickets = () =>
  request('/api/v1/tickets');

// IA
export const chatWithIA = (message: string) =>
  request('/api/v1/ia/chat', {
    method: 'POST',
    body: JSON.stringify({ message }),
  });

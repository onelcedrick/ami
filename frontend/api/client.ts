const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

let authToken: string | null = null;

export const setToken = (token: string | null) => {
  authToken = token;
  if (typeof window !== 'undefined') {
    if (token) localStorage.setItem('token', token);
    else localStorage.removeItem('token');
  }
};

export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return authToken || localStorage.getItem('token');
};

class ApiClient {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = getToken();
    const headers: Record<string, string> = {};

    if (options.body) headers['Content-Type'] = 'application/json';
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: { ...headers, ...options.headers },
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: 'Erreur inconnue' }));
      throw new Error(error.error || `Erreur ${res.status}`);
    }

    return res.json();
  }

  // Auth
  async login(email: string, password: string) {
    return this.request<any>('/api/v1/auth/login', {
      method: 'POST', body: JSON.stringify({ email, password }),
    });
  }

  async register(data: { email: string; password: string; first_name: string; last_name: string }) {
    return this.request<any>('/api/v1/auth/register', {
      method: 'POST', body: JSON.stringify(data),
    });
  }

  // Products
  async getProducts(params?: Record<string, string>) {
    const q = params ? `?${new URLSearchParams(params)}` : '';
    return this.request<any>(`/api/v1/products${q}`);
  }

  async getCategories() {
    return this.request<any[]>('/api/v1/categories');
  }

  // Cart
  async getCart() {
    return this.request<any>('/api/v1/cart');
  }

  async addToCart(productId: string, quantity = 1) {
    return this.request<any>('/api/v1/cart/items', {
      method: 'POST', body: JSON.stringify({ product_id: productId, quantity }),
    });
  }

  // Orders
  async createOrder(address: string) {
    return this.request<any>('/api/v1/orders', {
      method: 'POST', body: JSON.stringify({ shipping_address: address, payment_method: 'card' }),
    });
  }

  async getOrders() {
    return this.request<any[]>('/api/v1/orders');
  }

  // Tickets
  async getTickets() {
    return this.request<any[]>('/api/v1/tickets');
  }

  async createTicket(data: { subject: string; description: string; priority?: string }) {
    return this.request<any>('/api/v1/tickets', {
      method: 'POST', body: JSON.stringify(data),
    });
  }

  // IA
  async chatWithIA(message: string) {
    return this.request<any>('/api/v1/ia/chat', {
      method: 'POST', body: JSON.stringify({ message }),
    });
  }
}

export const apiClient = new ApiClient();

// Admin Products
async createProduct(data: any) {
  return this.request<any>('/api/v1/products', {
    method: 'POST', body: JSON.stringify(data),
  });
}

async updateProduct(id: string, data: any) {
  return this.request<any>(`/api/v1/products/${id}`, {
    method: 'PUT', body: JSON.stringify(data),
  });
}

async deleteProduct(id: string) {
  return this.request<any>(`/api/v1/products/${id}`, {
    method: 'DELETE',
  });
}

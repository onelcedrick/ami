import api from './axios';

export const getProducts = async (params: Record<string, any> = {}) => {
  const query = new URLSearchParams(params).toString();
  return await api.get(`/api/v1/products${query ? `?${query}` : ''}`);
};

export const getProduct = async (id: string) => {
  return await api.get(`/api/v1/products/${id}`);
};

export const getCategories = async () => {
  return await api.get('/api/v1/categories');
};

export const getFeaturedProducts = async () => {
  return await api.get('/api/v1/products/featured');
};

export const getSimilarProducts = async (productId: string) => {
  return await api.get(`/api/v1/ia/similar/${productId}`);
};

export const getRecommendations = async (userId: string) => {
  return await api.get(`/api/v1/ia/recommendations/${userId}`);
};

export const createProduct = async (data: any) => {
  return await api.post('/api/v1/products', data);
};

export const updateProduct = async (id: string, data: any) => {
  return await api.put(`/api/v1/products/${id}`, data);
};

export const deleteProduct = async (id: string) => {
  return await api.delete(`/api/v1/products/${id}`);
};

import api from './axios';

export const getOrders = async () => {
  return await api.get('/api/v1/orders');
};

export const getOrder = async (id: string) => {
  return await api.get(`/api/v1/orders/${id}`);
};

export const createOrder = async (data: any) => {
  return await api.post('/api/v1/orders', data);
};

export const cancelOrder = async (id: string) => {
  return await api.put(`/api/v1/orders/${id}/cancel`);
};

export const getAdminOrders = async () => {
  return await api.get('/api/v1/admin/orders');
};

export const updateOrderStatus = async (id: string, status: string) => {
  return await api.put(`/api/v1/admin/orders/${id}/status`, { status });
};

import api from './axios';

export const getDiscounts = async () => {
  return await api.get('/api/v1/admin/discounts');
};

export const createDiscount = async (data: any) => {
  return await api.post('/api/v1/admin/discounts', data);
};

export const toggleDiscount = async (id: string) => {
  return await api.patch(`/api/v1/admin/discounts/${id}/toggle`);
};

export const deleteDiscount = async (id: string) => {
  return await api.delete(`/api/v1/admin/discounts/${id}`);
};

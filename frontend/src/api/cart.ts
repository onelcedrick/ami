import api from './axios';

export const getCart = async () => {
  return await api.get('/api/v1/cart');
};

export const addToCart = async (productId: string, quantity = 1) => {
  return await api.post('/api/v1/cart/items', { product_id: productId, quantity });
};

export const updateCartItem = async (itemId: string, quantity: number) => {
  return await api.put(`/api/v1/cart/items/${itemId}`, { quantity });
};

export const removeFromCart = async (itemId: string) => {
  return await api.delete(`/api/v1/cart/items/${itemId}`);
};

export const clearCart = async () => {
  return await api.delete('/api/v1/cart');
};

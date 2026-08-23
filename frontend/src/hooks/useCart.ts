'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/src/api/axios';
import toast from 'react-hot-toast';
import { useAuth } from './useAuth';

export function useCart() {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      setItems([]);
      setTotal(0);
      return;
    }
    try {
      setLoading(true);
      const res: any = await api.get('/api/v1/cart');
      const cartItems = res.items || res.data?.items || [];
      setItems(cartItems);
      setTotal(res.total || 0);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addItem = async (productId: string, quantity = 1) => {
    if (!isAuthenticated) {
      toast.error('Veuillez vous connecter pour ajouter au panier');
      return;
    }
    try {
      await api.post('/api/v1/cart/items', { product_id: productId, quantity });
      toast.success('Produit ajouté au panier');
      await fetchCart();
      window.dispatchEvent(new Event('cart-updated'));
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Erreur lors de l’ajout au panier');
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    try {
      await api.put(`/api/v1/cart/items/${itemId}`, { quantity });
      await fetchCart();
      window.dispatchEvent(new Event('cart-updated'));
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Erreur lors de la mise à jour');
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      await api.delete(`/api/v1/cart/items/${itemId}`);
      toast.success('Article retiré');
      await fetchCart();
      window.dispatchEvent(new Event('cart-updated'));
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Erreur');
    }
  };

  const clear = async () => {
    try {
      await api.delete('/api/v1/cart');
      setItems([]);
      setTotal(0);
      window.dispatchEvent(new Event('cart-updated'));
    } catch {
      // ignore
    }
  };

  return {
    items,
    total,
    loading,
    addItem,
    updateQuantity,
    removeItem,
    clear,
    refresh: fetchCart,
  };
}

export default useCart;

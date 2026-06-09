'use client';

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

interface CartContextType {
  cart: any | null;
  cartCount: number;
  isLoading: boolean;
  addToCart: (productId: string, name: string) => Promise<void>;
  refreshCart: () => Promise<void>;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType>({} as CartContextType);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
    const token = localStorage.getItem('token');
    const headers: Record<string, string> = {};
    if (options.body) headers['Content-Type'] = 'application/json';
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
    if (!res.ok) throw new Error('Erreur');
    return res.json();
  };

  const refreshCart = useCallback(async () => {
    if (!localStorage.getItem('token')) return;
    try { setCart(await apiFetch('/api/v1/cart')); } catch {}
    finally { setIsLoading(false); }
  }, []);

  const addToCart = async (productId: string) => {
    await apiFetch('/api/v1/cart/items', { method: 'POST', body: JSON.stringify({ product_id: productId, quantity: 1 }) });
    await refreshCart();
  };

  useEffect(() => { refreshCart(); }, [refreshCart]);

  return (
    <CartContext.Provider value={{ cart, cartCount: cart?.total_items || 0, isLoading, addToCart, refreshCart, clearCart: () => setCart(null) }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);

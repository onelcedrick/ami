'use client';

// -*- coding: utf-8 -*-
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import api from '@/src/api/axios';
import { useAuth } from '@/src/hooks/useAuth';
import { IconTrash, IconPackage } from '@/src/components/Icons';
import Link from 'next/link';

export default function CartPage() {
  const [cart, setCart] = useState<any>({ items: [], total: 0, count: 0 });
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) { setLoading(false); return; }
    loadCart();
  }, [isAuthenticated]);

  const loadCart = () => {
    api.get('/api/v1/cart')
      .then((res: any) => setCart(res))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const updateQuantity = (itemId: string, qty: number) => {
    if (qty < 1) return;
    api.put(`/api/v1/cart/items/${itemId}`, { quantity: qty })
      .then(() => loadCart())
      .catch((err: any) => toast.error(err.response?.data?.detail || 'Erreur'));
  };

  const removeItem = (itemId: string, name: string) => {
    api.delete(`/api/v1/cart/items/${itemId}`)
      .then(() => {
        toast.success(`${name || 'Produit'} retire du panier`);
        loadCart();
      })
      .catch(() => toast.error('Erreur'));
  };

  const createOrder = () => {
    api.post('/api/v1/orders', { shipping_address: 'Retrait en boutique', payment_method: 'boutique' })
      .then(() => {
        toast.success('Commande creee ! Paiement en boutique.');
        router.push('/orders');
      })
      .catch((err: any) => toast.error(err.response?.data?.detail || 'Erreur'));
  };

  if (loading) {
    return (
      <div>
        <h1 className="text-xl md:text-2xl font-bold mb-6">Mon Panier</h1>
        <div className="space-y-3 animate-pulse">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-4 flex gap-4">
              <div className="w-16 h-16 bg-gray-200 rounded-xl" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="text-center py-20">
        <IconPackage size={48} className="mx-auto text-gray-300 mb-4" />
        <h2 className="text-xl font-bold text-gray-600 mb-2">Votre panier est vide</h2>
        <p className="text-gray-400 mb-4">Ajoutez des produits depuis notre catalogue.</p>
        <Link href="/products" className="bg-blue-600 text-white px-6 py-2 rounded-full text-sm hover:bg-blue-700 transition">
          Voir les produits
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Mon Panier ({cart.count || cart.total_items})</h1>

      <div className="space-y-3 mb-6">
        {cart.items.map((item: any) => (
          <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 md:p-4 flex items-center gap-3 md:gap-4">
            <div className="w-14 h-14 md:w-16 md:h-16 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
              <IconPackage size={24} className="text-gray-400" />
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-sm md:text-base truncate">{item.product?.name || 'Produit'}</h3>
              <p className="text-blue-600 font-bold text-sm">{item.product?.price?.toFixed(2)} EUR</p>
            </div>

            <div className="hidden md:flex items-center gap-3 bg-gray-50 rounded-full px-2 py-1">
              <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-8 h-8 rounded-full bg-white border text-lg font-bold hover:bg-gray-100">&minus;</button>
              <span className="font-bold w-6 text-center">{item.quantity}</span>
              <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-8 h-8 rounded-full bg-white border text-lg font-bold hover:bg-gray-100">+</button>
            </div>

            <div className="hidden md:block text-right w-28">
              <p className="font-bold text-lg">{item.subtotal?.toFixed(2)} EUR</p>
            </div>

            <button onClick={() => removeItem(item.id, item.product?.name)} className="text-gray-300 hover:text-red-500 transition p-2 flex-shrink-0" title="Retirer">
              <IconTrash size={18} />
            </button>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6">
        <div className="flex justify-between items-center mb-4">
          <span className="font-bold text-lg">Total</span>
          <span className="text-xl font-bold text-blue-600">{cart.total_price?.toFixed(2)} EUR</span>
        </div>
        <button onClick={createOrder} className="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition">
          Commander (Paiement en boutique)
        </button>
        <p className="text-gray-400 text-xs text-center mt-2">Paiement sur place au point de vente</p>
      </div>
    </div>
  );
}

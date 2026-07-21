// -*- coding: utf-8 -*-
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import api from '@/src/api/axios';
import { IconHeart, IconPackage } from '@/src/components/Icons';

export default function WishlistPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/v1/wishlist').then((r: any) => setItems(Array.isArray(r) ? r : [])).finally(() => setLoading(false));
  }, []);

  const removeFromWishlist = async (productId: string) => {
    setItems(prev => prev.filter(i => i.id !== productId));
    toast.success('Retire des favoris');
  };

  const addToCart = async (productId: string, name: string) => {
    try {
      await api.post('/api/v1/cart/items', { product_id: productId, quantity: 1 });
      toast.success(`${name} ajoute au panier`);
    } catch (err: any) {
      toast.error(err.message || 'Erreur');
    }
  };

  if (loading) return <div className="text-center py-10 text-gray-400">Chargement...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 dark:text-white">Mes Favoris</h1>
      {items.length === 0 ? (
        <div className="text-center py-20">
          <IconHeart size={48} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl font-bold text-gray-600 dark:text-gray-300 mb-2">Aucun favori</h2>
          <p className="text-gray-400 mb-4">Ajoutez des produits a vos favoris depuis le catalogue.</p>
          <Link href="/products" className="bg-blue-600 text-white px-6 py-2 rounded-full text-sm hover:bg-blue-700 transition">Decouvrir les produits</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {items.map(p => (
            <div key={p.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow hover:shadow-md transition overflow-hidden group relative">
              <button onClick={() => removeFromWishlist(p.id)}
                className="absolute top-2 right-2 z-10 w-8 h-8 bg-white dark:bg-gray-700 rounded-full shadow flex items-center justify-center text-red-500 hover:bg-red-50 dark:hover:bg-red-900 transition">
                <IconHeart filled size={16} />
              </button>
              <Link href={`/products/${p.id}`}>
                <div className="h-40 bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                  <IconPackage size={48} className="text-gray-300 dark:text-gray-600" />
                </div>
              </Link>
              <div className="p-3">
                <Link href={`/products/${p.id}`}><h3 className="font-bold text-sm truncate hover:text-blue-600 dark:text-gray-200">{p.name}</h3></Link>
                <p className="text-blue-600 font-bold text-sm mt-1">{p.price?.toFixed(2)} EUR</p>
                <button onClick={() => addToCart(p.id, p.name)}
                  className="w-full mt-2 bg-blue-600 text-white py-1.5 rounded-lg text-xs hover:bg-blue-700 transition">
                  Ajouter au panier
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

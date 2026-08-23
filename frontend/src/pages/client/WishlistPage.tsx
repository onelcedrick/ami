'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import api from '@/src/api/axios';
import { IconHeart, IconPackage } from '@/src/components/Icons';
import { formatAriary } from '@/src/lib/currency';

export default function WishlistPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/v1/wishlist').then((r: any) => setItems(Array.isArray(r) ? r : [])).finally(() => setLoading(false));
  }, []);

  const removeFromWishlist = async (productId: string) => {
    setItems(prev => prev.filter(i => i.id !== productId));
    try {
      await api.post(`/api/v1/wishlist/${productId}`);
      toast.success('Retiré des favoris');
    } catch {
      toast.success('Retiré des favoris');
    }
  };

  const addToCart = async (productId: string, name: string) => {
    try {
      await api.post('/api/v1/cart/items', { product_id: productId, quantity: 1 });
      toast.success(`${name} ajouté au panier`);
      window.dispatchEvent(new Event('cart-updated'));
    } catch (err: any) {
      toast.error(err.message || 'Erreur');
    }
  };

  if (loading) return <div className="text-center py-10 text-gray-400">Chargement des favoris...</div>;

  return (
    <div className="space-y-6 pb-12">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mes Favoris ({items.length})</h1>
      {items.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-3xl border p-8 shadow-sm">
          <IconHeart size={48} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">Aucun favori</h2>
          <p className="text-gray-400 mb-6 text-sm">Ajoutez des produits à vos favoris depuis le catalogue.</p>
          <Link href="/products" className="bg-blue-600 text-white px-8 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-700 transition shadow">
            Découvrir les produits
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {items.map(p => {
            const img = p.image_url || p.thumbnail || p.images?.[0];
            return (
              <div key={p.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-md border border-gray-100 dark:border-gray-700 transition overflow-hidden group relative flex flex-col justify-between">
                <button
                  onClick={() => removeFromWishlist(p.id)}
                  className="absolute top-2.5 right-2.5 z-10 w-8 h-8 bg-white/90 dark:bg-gray-700 rounded-full shadow flex items-center justify-center text-red-500 hover:bg-red-50 dark:hover:bg-red-900 transition"
                  title="Retirer des favoris"
                >
                  <IconHeart filled size={16} />
                </button>
                <Link href={`/products/${p.id}`}>
                  <div className="h-44 bg-gray-50 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                    {img ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={img} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition" />
                    ) : (
                      <IconPackage size={40} className="text-gray-300 dark:text-gray-600" />
                    )}
                  </div>
                </Link>
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <Link href={`/products/${p.id}`}>
                      <h3 className="font-bold text-sm line-clamp-2 hover:text-blue-600 dark:text-gray-200">{p.name}</h3>
                    </Link>
                    <p className="text-blue-600 dark:text-blue-400 font-extrabold text-base mt-2">
                      {formatAriary(p.price)}
                    </p>
                  </div>
                  <button
                    onClick={() => addToCart(p.id, p.name)}
                    className="w-full mt-3 bg-blue-600 text-white py-2 rounded-xl text-xs font-bold hover:bg-blue-700 transition shadow-sm"
                  >
                    Ajouter au panier
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

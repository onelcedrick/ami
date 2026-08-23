'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { IconPackage, IconTrash, IconCart, IconStar } from '@/src/components/Icons';
import SEO from '@/src/components/SEO';
import { useAuth } from '@/src/hooks/useAuth';
import api from '@/src/api/axios';
import toast from 'react-hot-toast';
import { formatAriary } from '@/src/lib/currency';

export default function ComparePage() {
  const { isAuthenticated } = useAuth();
  const [compareItems, setCompareItems] = useState<any[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('am_compare_items');
      if (stored) {
        setCompareItems(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
  }, []);

  const removeFromCompare = (id: string) => {
    const updated = compareItems.filter((i) => i.id !== id);
    setCompareItems(updated);
    localStorage.setItem('am_compare_items', JSON.stringify(updated));
    window.dispatchEvent(new Event('compare-updated'));
    toast.success('Produit retiré du comparateur');
  };

  const clearAll = () => {
    setCompareItems([]);
    localStorage.removeItem('am_compare_items');
    window.dispatchEvent(new Event('compare-updated'));
  };

  const addToCart = async (p: any) => {
    if (!isAuthenticated) {
      toast.error('Veuillez vous connecter pour ajouter au panier');
      return;
    }
    try {
      await api.post('/api/v1/cart/items', { product_id: p.id, quantity: 1 });
      toast.success(`${p.name} ajouté au panier`);
      window.dispatchEvent(new Event('cart-updated'));
    } catch {
      toast.error('Erreur lors de l’ajout au panier');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <SEO
        title="Comparateur de Matériel Informatique"
        description="Comparez les caractéristiques techniques, prix et performances de nos composants, PC portables et stations gaming."
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            Comparateur de Matériel
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Comparez côte à côte jusqu&apos;à 4 produits pour faire le meilleur choix.
          </p>
        </div>
        {compareItems.length > 0 && (
          <button
            onClick={clearAll}
            className="text-xs font-semibold text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 self-start sm:self-auto"
          >
            Vider le comparateur
          </button>
        )}
      </div>

      {compareItems.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4 text-blue-600 dark:text-blue-400">
            <IconPackage size={32} />
          </div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Votre comparateur est vide</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto mb-6">
            Parcourez notre catalogue et cliquez sur le bouton &quot;Comparer&quot; pour ajouter des produits ici.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-blue-700 transition"
          >
            Voir les produits
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto pb-4">
          <div className="inline-flex min-w-full gap-4">
            {compareItems.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-72 shrink-0 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 shadow-sm flex flex-col justify-between"
              >
                <div>
                  {/* Image & Remove */}
                  <div className="relative aspect-video bg-gray-50 dark:bg-gray-700 rounded-xl overflow-hidden mb-4 border border-gray-100 dark:border-gray-600 flex items-center justify-center">
                    {item.image_url ? (
                      <Image
                        src={item.image_url}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <IconPackage size={36} className="text-gray-300 dark:text-gray-500" />
                    )}
                    <button
                      onClick={() => removeFromCompare(item.id)}
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/50 text-white hover:bg-red-600 transition backdrop-blur-sm"
                      title="Retirer"
                    >
                      <IconTrash size={14} />
                    </button>
                  </div>

                  <span className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400">
                    {item.category?.name || item.brand || 'Matériel'}
                  </span>
                  <Link
                    href={`/products/${item.id}`}
                    className="block text-sm font-bold text-gray-900 dark:text-white mt-1 hover:text-blue-600 dark:hover:text-blue-400 line-clamp-2"
                  >
                    {item.name}
                  </Link>
                  <p className="text-lg font-bold text-blue-600 dark:text-blue-400 mt-2">
                    {formatAriary(item.price)}
                  </p>

                  <hr className="my-4 border-gray-100 dark:border-gray-700" />

                  {/* Spec Rows */}
                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="text-gray-400 block mb-0.5">Marque / Modèle</span>
                      <span className="font-semibold text-gray-800 dark:text-gray-200">
                        {item.brand || 'AM Info'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400 block mb-0.5">Disponibilité</span>
                      <span
                        className={`font-semibold ${
                          (item.stock_quantity || item.stock || 0) > 0
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-500'
                        }`}
                      >
                        {(item.stock_quantity || item.stock || 0) > 0 ? 'En Stock' : 'Rupture'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400 block mb-0.5">Avis Clients</span>
                      <div className="flex items-center gap-1 font-semibold text-yellow-500">
                        <IconStar size={14} className="fill-current" />
                        <span>{item.rating_avg || 4.8} / 5</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-400 block mb-0.5">Description rapide</span>
                      <p className="text-gray-600 dark:text-gray-300 line-clamp-3">
                        {item.short_description || item.description || 'Composant haute qualité testé en laboratoire AM Info.'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
                  <button
                    onClick={() => addToCart(item)}
                    className="w-full bg-blue-600 text-white py-2 rounded-xl text-xs font-bold hover:bg-blue-700 transition flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <IconCart size={14} /> Ajouter au panier
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

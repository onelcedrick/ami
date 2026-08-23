// -*- coding: utf-8 -*-
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import api from '@/src/api/axios';
import { useAuth } from '@/src/hooks/useAuth';
import { IconHeart, IconPackage } from './Icons';
import { formatAriary } from '@/src/lib/currency';

interface ProductCardProps {
  product: any;
  onAddToCart?: (productId: string) => void;
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const [isFav, setIsFav] = useState(false);
  const [inCompare, setInCompare] = useState(false);
  const { isAuthenticated } = useAuth();
  const finalPrice = product.final_price || product.price;
  const hasDiscount = (product.compare_price && product.compare_price > product.price) || (product.discount_percent && product.discount_percent > 0);
  const discountPct = product.discount_percent || (product.compare_price ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100) : 0);
  const imgUrl = product.image_url || product.thumbnail || product.images?.[0];

  useEffect(() => {
    if (!isAuthenticated) return;
    api.get('/wishlist/ids').then(r => setIsFav((r.data || []).includes(product.id))).catch(() => {});
    
    const compareList = JSON.parse(localStorage.getItem('compareList') || '[]');
    setInCompare(compareList.includes(product.id));
  }, [isAuthenticated, product.id]);

  const toggleFav = async (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (!isAuthenticated) {
      toast.error('Connectez-vous pour ajouter aux favoris');
      return;
    }
    try { const res = await api.post(`/wishlist/${product.id}`); setIsFav(res.data.added); } catch {}
  };

  const toggleCompare = (e: React.MouseEvent) => {
    e.preventDefault();
    const compareList = JSON.parse(localStorage.getItem('compareList') || '[]');
    const savedCategory = localStorage.getItem('compareCategory');
    
    if (compareList.includes(product.id)) {
      const updated = compareList.filter((id: string) => id !== product.id);
      localStorage.setItem('compareList', JSON.stringify(updated));
      setInCompare(false);
      if (updated.length === 0) localStorage.removeItem('compareCategory');
      toast.success('Retiré de la comparaison');
    } else if (compareList.length >= 4) {
      toast.error('Maximum 4 produits à comparer');
    } else if (savedCategory && product.category?.id && product.category?.id !== savedCategory) {
      toast.error('Catégorie différente ! Comparez des produits équivalents.', { duration: 4000 });
    } else {
      compareList.push(product.id);
      localStorage.setItem('compareList', JSON.stringify(compareList));
      localStorage.setItem('compareCategory', product.category?.id || '');
      setInCompare(true);
      toast.success(`Ajouté au comparateur (${compareList.length}/4)`);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-md border border-gray-100 transition overflow-hidden group relative flex flex-col justify-between">
      {/* Wishlist button */}
      <button
        onClick={toggleFav}
        className={`absolute top-3 right-3 z-10 w-8 h-8 rounded-full shadow flex items-center justify-center transition ${
          isFav ? 'bg-red-50 text-red-500' : 'bg-white/90 text-gray-400 hover:text-red-500'
        }`}
        title={isFav ? 'Retirer des favoris' : 'Ajouter aux favoris'}
      >
        <IconHeart filled={isFav} size={16} />
      </button>

      {/* Promo Badge */}
      {hasDiscount && discountPct > 0 && (
        <span className="absolute top-3 left-3 bg-red-600 text-white text-[11px] font-black px-2.5 py-0.5 rounded-full shadow z-10">
          PROMO -{discountPct}%
        </span>
      )}

      {/* Image link */}
      <Link href={`/products/${product.id}`} className="block relative">
        <div className="h-44 sm:h-52 bg-gray-50 flex items-center justify-center overflow-hidden border-b border-gray-50">
          {imgUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imgUrl}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
            />
          ) : (
            <IconPackage size={40} className="text-gray-300" />
          )}
        </div>
      </Link>

      {/* Body content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider mb-1 truncate">
            {product.category?.name || product.brand || 'AM Info'}
          </div>

          <Link href={`/products/${product.id}`}>
            <h3 className="font-bold text-sm text-gray-900 line-clamp-2 hover:text-blue-600 transition leading-snug">
              {product.name}
            </h3>
          </Link>
        </div>

        <div className="pt-3">
          {/* Price formatted in Ariary */}
          <div className="flex items-baseline gap-2 mb-3 flex-wrap">
            <span className="text-lg font-extrabold text-blue-600">
              {formatAriary(finalPrice)}
            </span>
            {hasDiscount && product.compare_price && (
              <span className="text-xs text-gray-400 line-through">
                {formatAriary(product.compare_price)}
              </span>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 mb-2">
            <Link
              href={`/products/${product.id}`}
              className="flex-1 text-center border border-gray-200 text-gray-700 py-2 rounded-xl text-xs font-semibold hover:bg-gray-50 transition"
            >
              Détails
            </Link>
            <button
              onClick={() => onAddToCart && onAddToCart(product.id)}
              className="flex-1 bg-blue-600 text-white py-2 rounded-xl text-xs font-bold hover:bg-blue-700 transition shadow-sm"
            >
              Ajouter
            </button>
          </div>

          <button
            onClick={toggleCompare}
            className={`w-full text-xs py-1 rounded-lg transition text-center ${
              inCompare
                ? 'bg-blue-50 text-blue-600 font-semibold'
                : 'text-gray-400 hover:text-blue-600'
            }`}
          >
            {inCompare ? '✓ Comparateur' : '+ Comparer'}
          </button>
        </div>
      </div>
    </div>
  );
}

'use client';

// -*- coding: utf-8 -*-
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import api from '@/src/api/axios';
import ProductCard from '@/src/components/ProductCard';
import { useAuth } from '@/src/hooks/useAuth';
import { addRecentlyViewed, getRecentlyViewed } from '@/src/hooks/useRecentlyViewed';
import { IconPackage } from '@/src/components/Icons';

export default function ProductDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const [product, setProduct] = useState<any>(null);
  const [similarProducts, setSimilarProducts] = useState<any[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<any[]>([]);
  const [quantity, setQuantity] = useState(1);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!id) return;
    api.get(`/api/v1/products/${id}`).then((r: any) => {
      if (r) {
        setProduct(r);
        addRecentlyViewed(r);
        setRecentlyViewed(getRecentlyViewed().filter(p => p.id !== r.id));
        if (r.category?.id) {
          api.get(`/api/v1/products?category=${r.category.id}&limit=4`).then((res: any) => {
            setSimilarProducts((res.data || []).filter((p: any) => p.id !== r.id).slice(0, 4));
          }).catch(() => {});
        }
      }
    }).catch(() => {});
  }, [id]);

  const addToCart = async (productId: string, name: string) => {
    if (!isAuthenticated) return;
    try { await api.post('/api/v1/cart/items', { product_id: productId, quantity: 1 }); toast.success(`${name} ajoute au panier`); }
    catch (err: any) { toast.error(err.response?.data?.detail || 'Erreur'); }
  };

  if (!product) return <div className="text-center py-20"><div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto" /></div>;

  const finalPrice = product.price;

  return (
    <div>
      <nav className="text-xs text-gray-400 mb-4">
        <Link href="/" className="hover:text-blue-600">Accueil</Link><span className="mx-2">/</span>
        <Link href="/products" className="hover:text-blue-600">Produits</Link><span className="mx-2">/</span>
        <span className="text-gray-600">{product.category?.name || product.name}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div className="bg-gray-50 rounded-2xl h-80 md:h-96 flex items-center justify-center overflow-hidden">
          <IconPackage size={80} className="text-gray-300" />
        </div>
        <div>
          <span className="text-sm text-blue-600 font-medium mb-1">{product.category?.name || ''}</span>
          <h1 className="text-3xl font-bold mb-3">{product.name}</h1>
          <p className="text-gray-500 mb-6">{product.description || 'Aucune description.'}</p>
          <span className="text-3xl font-bold text-blue-600">{finalPrice?.toFixed(2)} EUR</span>
          {product.stock_quantity > 0 && <p className="text-sm text-green-600 mt-2">En stock ({product.stock_quantity})</p>}
          <div className="flex items-center gap-4 mt-6">
            <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-9 h-9 border rounded-full">&minus;</button>
            <span className="font-bold text-lg">{quantity}</span>
            <button onClick={() => setQuantity(quantity + 1)} className="w-9 h-9 border rounded-full">+</button>
          </div>
          <button onClick={() => addToCart(product.id, product.name)} disabled={product.stock_quantity === 0}
            className="w-full mt-4 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition disabled:opacity-50">
            Ajouter au panier
          </button>
        </div>
      </div>

      {similarProducts.length > 0 && (
        <div className="border-t pt-8">
          <h2 className="text-xl font-bold mb-4">Produits similaires</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {similarProducts.map(p => <ProductCard key={p.id} product={p} onAddToCart={(id) => addToCart(id, p.name)} />)}
          </div>
        </div>
      )}
    </div>
  );
}

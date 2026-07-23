'use client';

// -*- coding: utf-8 -*-
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import api from '@/src/api/axios';
import ProductCard from '@/src/components/ProductCard';
import Pagination from '@/src/components/Pagination';
import { useAuth } from '@/src/hooks/useAuth';
import { IconPackage, IconClose } from '@/src/components/Icons';

const SkeletonCard = () => (
  <div className="bg-white rounded-2xl shadow p-3 animate-pulse">
    <div className="h-32 md:h-48 bg-gray-200 rounded-xl mb-3" />
    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
    <div className="h-3 bg-gray-200 rounded w-1/2" />
  </div>
);

export default function ProductListPage() {
  const [data, setData] = useState<any>({ items: [], total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [allCategories, setAllCategories] = useState<any[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const loadProducts = (page = 1) => {
    setLoading(true);
    const params: Record<string, string> = { page: String(page), limit: '12' };
    if (search) params.q = search;
    api.get(`/api/v1/products?${new URLSearchParams(params)}`).then((r: any) => {
      const products = r.data || [];
      setData({ items: products, total: r.pagination?.total || products.length, page, pages: r.pagination?.total_pages || 1 });
      const cats = Array.from(new Set(products.map((p: any) => p.category?.name || p.category_id).filter(Boolean)));
      setAllCategories(cats as any);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { loadProducts(); }, []);
  useEffect(() => { loadProducts(1); }, [search, category]);

  const addToCart = async (productId: string) => {
    if (!isAuthenticated) { router.push('/login'); return; }
    try {
      await api.post('/api/v1/cart/items', { product_id: productId, quantity: 1 });
      toast.success('Ajoute au panier');
    } catch (err: any) { toast.error(err.response?.data?.detail || 'Erreur'); }
  };

  return (
    <div>
      <nav className="text-xs text-gray-400 mb-3">
        <Link href="/" className="hover:text-blue-600">Accueil</Link><span className="mx-1">/</span>
        <span className="text-gray-600">Produits</span>
      </nav>

      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl md:text-2xl font-bold">Nos Produits</h1>
        <button onClick={() => setShowFilters(!showFilters)} className="md:hidden text-sm text-blue-600 font-medium flex items-center gap-1">
          {showFilters ? <IconClose size={16} /> : 'Filtres'}
        </button>
      </div>

      <div className="relative mb-4">
        <div className="flex gap-2 md:gap-4">
          <div className="flex-1 relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher un produit..."
              className="w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
          </div>
          <select value={category} onChange={e => setCategory(e.target.value)}
            className="hidden md:block px-4 py-2.5 border rounded-xl text-sm bg-white">
            <option value="">Toutes categories</option>
            {allCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>

        {showFilters && (
          <div className="md:hidden mt-2 bg-white rounded-xl shadow-lg border p-3 space-y-3">
            <p className="text-xs font-semibold text-gray-500">Categorie</p>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => { setCategory(''); setShowFilters(false); }}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${!category ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}>Toutes</button>
              {allCategories.map(cat => (
                <button key={cat} onClick={() => { setCategory(cat); setShowFilters(false); }}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${category === cat ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}>{cat}</button>
              ))}
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
          {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : data.items.length === 0 ? (
        <div className="text-center py-20">
          <IconPackage size={48} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl font-bold text-gray-600 mb-2">Aucun produit</h2>
          <p className="text-gray-400">{search ? `Aucun resultat pour "${search}"` : 'Le catalogue est vide.'}</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
            {data.items.map((p: any) => <ProductCard key={p.id} product={p} onAddToCart={addToCart} />)}
          </div>
          <Pagination page={data.page} pages={data.pages} total={data.total} onPageChange={loadProducts} />
        </>
      )}
    </div>
  );
}

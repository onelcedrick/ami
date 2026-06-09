'use client';

import { useEffect, useState } from 'react';
import { getProducts, addToCart, getCategories } from '@/lib/api';
import { getToken } from '@/lib/api';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  price: number;
  brand: string;
  stock_quantity: number;
  category?: { name: string; id: string };
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  const loadProducts = async (category?: string) => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (category) params.category = category;
      const data = await getProducts(params);
      setProducts(data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddToCart = async (productId: string, productName: string) => {
    if (!getToken()) {
      window.location.href = '/login';
      return;
    }
    setAddingId(productId);
    setMessage('');
    try {
      await addToCart(productId, 1);
      setMessage(`✅ "${productName}" ajouté au panier !`);
      setTimeout(() => setMessage(''), 3000);
    } catch (err: any) {
      setMessage('❌ ' + err.message);
    } finally {
      setAddingId(null);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Nos Produits</h1>
        {getToken() && (
          <Link href="/cart" className="btn btn-primary">
            🛒 Voir le panier
          </Link>
        )}
      </div>

      {message && (
        <div className={`p-4 rounded-lg mb-6 text-center ${message.startsWith('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-700'}`}>
          {message}
        </div>
      )}

      {/* Filtres catégories */}
      {categories.length > 0 && (
        <div className="flex gap-2 mb-6 flex-wrap">
          <button
            onClick={() => loadProducts()}
            className="px-4 py-2 rounded-full bg-gray-200 hover:bg-gray-300 text-sm font-medium"
          >
            Tous
          </button>
          {categories.map((cat: any) => (
            <button
              key={cat.id}
              onClick={() => loadProducts(cat.id)}
              className="px-4 py-2 rounded-full bg-gray-200 hover:bg-blue-100 hover:text-blue-700 text-sm font-medium transition"
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="text-center py-20">
          <div className="animate-spin text-4xl mb-4">⚙️</div>
          <p className="text-gray-500">Chargement des produits...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500 text-lg">Aucun produit trouvé.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <div key={product.id} className="card hover:shadow-lg transition transform hover:-translate-y-1">
              <div className="text-6xl text-center py-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-t-lg">
                📦
              </div>
              <div className="p-4">
                <span className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded">
                  {product.category?.name || 'Général'}
                </span>
                <h3 className="text-lg font-semibold mt-2 line-clamp-2">{product.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{product.brand}</p>
                
                <div className="flex items-center justify-between mt-3">
                  <span className="text-2xl font-bold text-blue-700">
                    {product.price.toFixed(2)} €
                  </span>
                  <span className={`text-xs font-medium px-2 py-1 rounded ${
                    product.stock_quantity > 10 ? 'bg-green-100 text-green-700' :
                    product.stock_quantity > 0 ? 'bg-orange-100 text-orange-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {product.stock_quantity > 10 ? 'En stock' :
                     product.stock_quantity > 0 ? `${product.stock_quantity} restants` :
                     'Rupture'}
                  </span>
                </div>

                <button
                  onClick={() => handleAddToCart(product.id, product.name)}
                  disabled={addingId === product.id || product.stock_quantity === 0}
                  className={`btn w-full mt-3 ${
                    product.stock_quantity === 0 
                      ? 'bg-gray-300 cursor-not-allowed' 
                      : 'btn-primary'
                  }`}
                >
                  {addingId === product.id ? '⏳ Ajout...' :
                   product.stock_quantity === 0 ? 'Indisponible' :
                   '🛒 Ajouter au panier'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

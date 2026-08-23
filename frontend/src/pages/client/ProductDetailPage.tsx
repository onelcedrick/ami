'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import toast from 'react-hot-toast';
import api from '@/src/api/axios';
import ProductCard from '@/src/components/ProductCard';
import { useAuth } from '@/src/hooks/useAuth';
import { useRecentlyViewed } from '@/src/hooks/useRecentlyViewed';
import { IconPackage, IconCart, IconStar, IconCheck } from '@/src/components/Icons';
import SEO from '@/src/components/SEO';
import { productJsonLd, breadcrumbJsonLd, SITE_URL } from '@/src/lib/seo';
import { formatAriary } from '@/src/lib/currency';

export default function ProductDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const [product, setProduct] = useState<any>(null);
  const [similarProducts, setSimilarProducts] = useState<any[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [isComparing, setIsComparing] = useState(false);
  const { isAuthenticated } = useAuth();
  const { addProduct, recentlyViewed } = useRecentlyViewed();

  useEffect(() => {
    if (!id) return;
    api.get(`/api/v1/products/${id}`).then((r: any) => {
      if (r && !r.error) {
        setProduct(r);
        addProduct(r);
        if (r.category_id || r.category?.id) {
          const catId = r.category_id || r.category?.id;
          api.get(`/api/v1/products?category=${catId}&limit=4`).then((res: any) => {
            setSimilarProducts((res.data || []).filter((p: any) => p.id !== r.id).slice(0, 4));
          }).catch(() => {});
        }
      }
    }).catch(() => {});
  }, [id]);

  useEffect(() => {
    if (!product) return;
    try {
      const stored = localStorage.getItem('am_compare_items');
      if (stored) {
        const items = JSON.parse(stored);
        setIsComparing(items.some((i: any) => i.id === product.id));
      }
    } catch {}
  }, [product]);

  const addToCart = async (productId: string, name: string) => {
    if (!isAuthenticated) {
      toast.error('Veuillez vous connecter pour ajouter au panier');
      return;
    }
    try {
      await api.post('/api/v1/cart/items', { product_id: productId, quantity });
      toast.success(`${quantity}x ${name} ajouté au panier`);
      window.dispatchEvent(new Event('cart-updated'));
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Erreur lors de l’ajout au panier');
    }
  };

  const toggleCompare = () => {
    if (!product) return;
    try {
      let items = [];
      const stored = localStorage.getItem('am_compare_items');
      if (stored) items = JSON.parse(stored);

      if (isComparing) {
        items = items.filter((i: any) => i.id !== product.id);
        setIsComparing(false);
        toast.success('Retiré du comparateur');
      } else {
        if (items.length >= 4) {
          toast.error('Vous pouvez comparer 4 produits au maximum');
          return;
        }
        items.push(product);
        setIsComparing(true);
        toast.success('Ajouté au comparateur');
      }
      localStorage.setItem('am_compare_items', JSON.stringify(items));
      window.dispatchEvent(new Event('compare-updated'));
    } catch {}
  };

  if (!product) {
    return (
      <div className="text-center py-20">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto" />
      </div>
    );
  }

  const finalPrice = product.price || 0;
  const inStock = (product.stock_quantity || product.stock || 0) > 0;

  return (
    <div className="space-y-10 pb-12">
      <SEO
        title={product.name}
        description={product.description || `${product.name} disponible chez AM Info.`}
        image={product.image_url || `${SITE_URL}/icon.svg`}
        url={`${SITE_URL}/products/${product.id}`}
        jsonLd={[
          productJsonLd(product),
          breadcrumbJsonLd([
            { name: 'Accueil', url: SITE_URL },
            { name: 'Produits', url: `${SITE_URL}/products` },
            { name: product.name, url: `${SITE_URL}/products/${product.id}` },
          ]),
        ]}
      />

      {/* Breadcrumb */}
      <nav className="text-xs text-gray-400 flex items-center gap-2 flex-wrap">
        <Link href="/" className="hover:text-blue-600 transition">Accueil</Link>
        <span>/</span>
        <Link href="/products" className="hover:text-blue-600 transition">Produits</Link>
        <span>/</span>
        <span className="text-gray-700 dark:text-gray-300 font-medium truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Product Main Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 bg-white dark:bg-gray-800 p-6 md:p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm">
        {/* Gallery / Image */}
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl aspect-square md:aspect-auto md:h-[460px] flex items-center justify-center overflow-hidden relative border border-gray-100 dark:border-gray-600">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          ) : (
            <IconPackage size={96} className="text-gray-300 dark:text-gray-500" />
          )}
          {product.compare_price && product.compare_price > product.price && (
            <span className="absolute top-4 left-4 bg-red-500 text-white text-xs font-extrabold px-3 py-1 rounded-full shadow-md">
              PROMO -{Math.round(((product.compare_price - product.price) / product.compare_price) * 100)}%
            </span>
          )}
        </div>

        {/* Product Details & Actions */}
        <div className="flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs uppercase font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full">
                {product.category?.name || product.brand || 'Matériel Pro'}
              </span>
              <button
                type="button"
                onClick={toggleCompare}
                className={`text-xs font-semibold px-3 py-1 rounded-full border transition ${
                  isComparing
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-blue-500'
                }`}
              >
                {isComparing ? '✓ Dans le comparateur' : '+ Comparer'}
              </button>
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white leading-tight">
              {product.name}
            </h1>

            {/* Rating & Stock */}
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1 text-amber-500 font-bold">
                <IconStar size={16} className="fill-current" />
                <span>{product.rating_avg || 4.8}</span>
                <span className="text-gray-400 font-normal">({product.rating_count || 24} avis)</span>
              </div>
              <span className="w-1 h-1 rounded-full bg-gray-300" />
              <span className={`font-semibold ${inStock ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
                {inStock ? `En stock (${product.stock_quantity || 14} dispo)` : 'Rupture temporaire'}
              </span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 pt-2">
              <span className="text-3xl md:text-4xl font-extrabold text-blue-600 dark:text-blue-400">
                {formatAriary(finalPrice)}
              </span>
              {product.compare_price && product.compare_price > product.price && (
                <span className="text-lg text-gray-400 line-through">
                  {formatAriary(product.compare_price)}
                </span>
              )}
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed pt-2">
              {product.description || 'Composant certifié testé dans nos ateliers AM Info avec garantie atelier.'}
            </p>

            {/* Service badges */}
            <div className="grid grid-cols-2 gap-2 pt-2 text-xs text-gray-600 dark:text-gray-300">
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                <span className="text-emerald-500">✓</span> Garantie Atelier 12 mois
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                <span className="text-blue-500">✓</span> Retrait Click & Collect 1h
              </div>
            </div>
          </div>

          {/* Add to Cart Controls */}
          <div className="pt-4 border-t border-gray-100 dark:border-gray-700 space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-gray-200 dark:border-gray-600 rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-700/50">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                >
                  -
                </button>
                <span className="w-12 text-center text-sm font-bold text-gray-900 dark:text-white">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                >
                  +
                </button>
              </div>

              <button
                type="button"
                onClick={() => addToCart(product.id, product.name)}
                disabled={!inStock}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <IconCart size={18} />
                Ajouter au panier
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Similar Products */}
      {similarProducts.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Produits Similaires Recommandés</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {similarProducts.map((p) => (
              <ProductCard key={p.id} product={p} onAddToCart={(id) => addToCart(id, p.name)} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

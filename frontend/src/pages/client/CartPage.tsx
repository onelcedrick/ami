'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import api from '@/src/api/axios';
import { useAuth } from '@/src/hooks/useAuth';
import { IconTrash, IconPackage, IconCheck } from '@/src/components/Icons';
import { formatAriary } from '@/src/lib/currency';

export default function CartPage() {
  const [cart, setCart] = useState<any>({ items: [], subtotal: 0, total: 0, count: 0, discount: null, discount_amount: 0 });
  const [loading, setLoading] = useState(true);
  const [couponCode, setCouponCode] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) { setLoading(false); return; }
    loadCart();
  }, [isAuthenticated]);

  const loadCart = () => {
    api.get('/api/v1/cart')
      .then((res: any) => {
        setCart(res);
        if (res.discount?.code) {
          setCouponCode(res.discount.code);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const updateQuantity = (itemId: string, qty: number) => {
    if (qty < 1) return;
    api.put(`/api/v1/cart/items/${itemId}`, { quantity: qty })
      .then((res: any) => {
        setCart(res);
        window.dispatchEvent(new Event('cart-updated'));
      })
      .catch((err: any) => toast.error(err.response?.data?.detail || 'Erreur mise à jour quantité'));
  };

  const removeItem = (itemId: string, name: string) => {
    api.delete(`/api/v1/cart/items/${itemId}`)
      .then((res: any) => {
        toast.success(`${name || 'Produit'} retiré du panier`);
        setCart(res);
        window.dispatchEvent(new Event('cart-updated'));
      })
      .catch(() => toast.error('Erreur'));
  };

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    setApplyingCoupon(true);
    try {
      const res = await api.post('/api/v1/cart/coupon', { code: couponCode.trim() });
      if (res.cart) setCart(res.cart);
      toast.success(res.message || 'Code promo appliqué avec succès !');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Code promo invalide ou expiré');
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = async () => {
    try {
      const res = await api.post('/api/v1/cart/remove-coupon');
      if (res.cart) setCart(res.cart);
      setCouponCode('');
      toast.success('Code promo retiré');
    } catch {
      toast.error('Erreur');
    }
  };

  const createOrder = () => {
    api.post('/api/v1/orders', { shipping_address: 'Retrait en boutique AM Info - Antananarivo', payment_method: 'boutique' })
      .then((order: any) => {
        toast.success('Commande créée avec succès !');
        window.dispatchEvent(new Event('cart-updated'));
        router.push('/orders');
      })
      .catch((err: any) => toast.error(err.response?.data?.detail || 'Erreur lors de la commande'));
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl md:text-2xl font-bold mb-6 text-gray-900">Mon Panier</h1>
        <div className="space-y-3 animate-pulse">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 flex gap-4 h-24 border" />
          ))}
        </div>
      </div>
    );
  }

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
        <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-4 text-3xl">
          🛒
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Votre panier est vide</h2>
        <p className="text-gray-400 mb-6 max-w-md mx-auto text-sm">
          Découvrez notre sélection de PC portables, stations gaming, composants et périphériques disponibles à Antananarivo.
        </p>
        <Link href="/products" className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-blue-700 transition shadow">
          Explorer le catalogue
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">
          Mon Panier ({cart.count || cart.total_items || cart.items.length} articles)
        </h1>
        <Link href="/products" className="text-sm font-semibold text-blue-600 hover:underline">
          + Continuer mes achats
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Items List */}
        <div className="lg:col-span-2 space-y-3">
          {cart.items.map((item: any) => {
            const img = item.product?.image_url || item.product?.thumbnail || item.product?.images?.[0];
            return (
              <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center gap-4 hover:border-blue-100 transition">
                {/* Thumbnail */}
                <div className="w-20 h-20 bg-gray-50 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0 border border-gray-100">
                  {img ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={img} alt={item.product?.name} className="w-full h-full object-cover" />
                  ) : (
                    <IconPackage size={28} className="text-gray-300" />
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <Link href={`/products/${item.product?.id || item.product_id}`} className="font-bold text-gray-900 hover:text-blue-600 text-sm md:text-base line-clamp-1">
                    {item.product?.name || 'Composant AM Info'}
                  </Link>
                  <p className="text-xs text-gray-400 mt-0.5">{item.product?.brand || 'AM Info'}</p>
                  <p className="text-blue-600 font-bold text-sm mt-1">{formatAriary(item.product?.price)}</p>
                </div>

                {/* Quantity */}
                <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-2 py-1 border border-gray-200">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                    className="w-7 h-7 rounded-lg bg-white border text-base font-bold hover:bg-gray-100 disabled:opacity-30 flex items-center justify-center"
                  >
                    &minus;
                  </button>
                  <span className="font-bold text-sm w-6 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="w-7 h-7 rounded-lg bg-white border text-base font-bold hover:bg-gray-100 flex items-center justify-center"
                  >
                    +
                  </button>
                </div>

                {/* Subtotal */}
                <div className="text-right w-32 hidden sm:block">
                  <p className="font-bold text-base text-gray-900">{formatAriary(item.subtotal || (item.product?.price * item.quantity))}</p>
                </div>

                {/* Remove */}
                <button
                  onClick={() => removeItem(item.id, item.product?.name)}
                  className="text-gray-300 hover:text-red-500 transition p-2"
                  title="Retirer"
                >
                  <IconTrash size={18} />
                </button>
              </div>
            );
          })}

          {/* PROMO CODES BANNER / SUGGESTIONS */}
          <div className="bg-blue-50/60 border border-blue-100 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div>
              <span className="font-bold text-blue-900">💡 Codes promo valides à Madagascar :</span>
              <p className="text-blue-700 mt-0.5">
                Utilisez <span className="font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-blue-200">BIENVENUE10</span> pour -10% immédiats ou <span className="font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-blue-200">AMINFO50K</span> dès 500 000 Ar d’achat.
              </p>
            </div>
            <button
              onClick={() => { setCouponCode('BIENVENUE10'); }}
              className="bg-white hover:bg-blue-100 text-blue-700 font-bold px-3 py-1.5 rounded-lg border border-blue-300 shadow-sm whitespace-nowrap"
            >
              Tester BIENVENUE10
            </button>
          </div>
        </div>

        {/* Order Summary & Checkout */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
          <h2 className="text-lg font-bold text-gray-900 border-b pb-3">Récapitulatif de commande</h2>

          {/* Promo code input form */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              🏷️ Code Promotionnel / Réduction
            </label>
            {cart.discount ? (
              <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                <div className="flex items-center gap-2">
                  <IconCheck size={18} className="text-emerald-600" />
                  <div>
                    <span className="font-mono font-bold text-xs text-emerald-900">{cart.discount.code}</span>
                    <p className="text-[11px] text-emerald-700">-{formatAriary(cart.discount_amount)} déduits</p>
                  </div>
                </div>
                <button
                  onClick={handleRemoveCoupon}
                  className="text-xs text-red-600 hover:text-red-700 font-semibold underline"
                >
                  Supprimer
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ex: BIENVENUE10"
                  value={couponCode}
                  onChange={e => setCouponCode(e.target.value.toUpperCase())}
                  className="flex-1 px-3.5 py-2.5 border rounded-xl font-mono text-sm uppercase outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white"
                />
                <button
                  type="submit"
                  disabled={applyingCoupon || !couponCode.trim()}
                  className="bg-gray-900 hover:bg-black text-white px-4 py-2.5 rounded-xl text-xs font-bold transition disabled:opacity-40"
                >
                  {applyingCoupon ? '...' : 'Appliquer'}
                </button>
              </form>
            )}
          </div>

          {/* Pricing breakdown */}
          <div className="space-y-3 pt-2 text-sm border-t border-gray-100">
            <div className="flex justify-between text-gray-600">
              <span>Sous-total articles :</span>
              <span className="font-semibold text-gray-900">{formatAriary(cart.subtotal || cart.total)}</span>
            </div>

            {cart.discount_amount > 0 && (
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span>Remise promotionnelle :</span>
                <span>-{formatAriary(cart.discount_amount)}</span>
              </div>
            )}

            <div className="flex justify-between text-gray-600">
              <span>Livraison à Antananarivo :</span>
              <span className="text-emerald-600 font-semibold">Gratuit</span>
            </div>

            <div className="flex justify-between items-baseline pt-3 border-t border-gray-200">
              <span className="font-bold text-gray-900 text-base">Total à régler :</span>
              <span className="text-2xl font-black text-blue-600">{formatAriary(cart.total || cart.total_price)}</span>
            </div>
            <p className="text-[11px] text-gray-400 text-right">Paiement en Ariary (MGA) avec Facture certifiée</p>
          </div>

          {/* Checkout Button */}
          <button
            onClick={createOrder}
            className="w-full bg-emerald-600 text-white py-3.5 rounded-xl font-bold hover:bg-emerald-700 transition shadow-md flex items-center justify-center gap-2"
          >
            <span>Commander (Paiement en boutique / Mobile)</span> &rarr;
          </button>

          {/* Badges */}
          <div className="space-y-2 pt-2 border-t text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <span className="text-emerald-500 font-bold">✓</span>
              <span>Paiement sécurisé MVola, Orange Money, Airtel Money ou Boutique</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-emerald-500 font-bold">✓</span>
              <span>Facture PDF certifiée téléchargeable immédiatement</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-emerald-500 font-bold">✓</span>
              <span>Garantie atelier 12 mois sur tout le matériel</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

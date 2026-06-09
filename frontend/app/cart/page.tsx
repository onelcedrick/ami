'use client';

import { useEffect, useState } from 'react';
import { getCart, createOrder, getToken } from '@/lib/api';
import Link from 'next/link';

export default function CartPage() {
  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!getToken()) {
      window.location.href = '/login';
      return;
    }
    loadCart();
  }, []);

  const loadCart = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getCart();
      console.log('Panier:', data);
      setCart(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async () => {
    try {
      const order = await createOrder('Adresse test, Paris');
      setMessage('✅ Commande ' + order.order_number + ' créée !');
      loadCart();
    } catch (err: any) {
      setMessage('❌ ' + err.message);
    }
  };

  if (loading) return <div className="container mx-auto px-4 py-20 text-center">Chargement...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">🛒 Mon Panier</h1>

      {error && <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-4">❌ {error}</div>}
      {message && <div className="bg-green-100 text-green-800 p-4 rounded-lg mb-4">{message}</div>}

      {!cart || !cart.items || cart.items.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🛒</div>
          <p className="text-gray-500 text-lg mb-6">Votre panier est vide</p>
          <Link href="/products" className="btn btn-primary">Voir les produits</Link>
        </div>
      ) : (
        <>
          {cart.items.map((item: any) => (
            <div key={item.id} className="card flex items-center gap-4 mb-3">
              <div className="text-4xl">📦</div>
              <div className="flex-1">
                <h3 className="font-semibold">{item.product?.name || 'Produit'}</h3>
                <p className="text-sm text-gray-500">{item.product?.price}€ x {item.quantity}</p>
              </div>
              <div className="font-bold text-lg">{item.subtotal?.toFixed(2)}€</div>
            </div>
          ))}
          <div className="card mt-4">
            <div className="flex justify-between mb-4">
              <span>{cart.total_items} articles</span>
              <span className="text-2xl font-bold text-blue-700">{cart.total_price?.toFixed(2)}€</span>
            </div>
            <button onClick={handleCheckout} className="btn btn-success w-full py-3">
              Commander maintenant
            </button>
          </div>
        </>
      )}
    </div>
  );
}

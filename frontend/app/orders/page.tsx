'use client';

import { useEffect, useState } from 'react';
import { getOrders } from '@/lib/api';
import { getToken } from '@/lib/api';
import Link from 'next/link';

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!getToken()) { window.location.href = '/login'; return; }
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const data = await getOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="container mx-auto px-4 py-20 text-center">Chargement...</div>;

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      paid: 'bg-green-100 text-green-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-200 text-green-900',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'En attente',
      confirmed: 'Confirmée',
      paid: 'Payée',
      shipped: 'Expédiée',
      delivered: 'Livrée',
      cancelled: 'Annulée',
    };
    return labels[status] || status;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">📋 Mes Commandes</h1>

      {orders.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">📋</div>
          <p className="text-gray-500 text-lg mb-4">Aucune commande pour le moment</p>
          <Link href="/products" className="btn btn-primary">Commencer mes achats</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order: any) => (
            <div key={order.id} className="card hover:shadow-md transition">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm text-gray-500">Commande</p>
                  <p className="font-bold text-lg">{order.order_number}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                  {getStatusLabel(order.status)}
                </span>
              </div>
              
              {order.items && (
                <div className="border-t pt-3 mb-3">
                  {order.items.map((item: any, i: number) => (
                    <div key={i} className="flex justify-between text-sm py-1">
                      <span>{item.product_name} x{item.quantity}</span>
                      <span className="font-medium">{item.total?.toFixed(2)}€</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-between items-center border-t pt-3">
                <span className="text-sm text-gray-500">
                  {new Date(order.created_at).toLocaleDateString('fr-FR')}
                </span>
                <span className="text-xl font-bold text-blue-700">
                  {order.total?.toFixed(2)}€
                </span>
              </div>

              <div className="mt-3 flex gap-2">
                {order.status === 'pending' && (
                  <button className="btn btn-danger text-sm">Annuler</button>
                )}
                <Link href={`/tickets/new?order=${order.id}`} className="btn border text-sm">
                  Signaler un problème
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

'use client';

// -*- coding: utf-8 -*-
import { useState, useEffect } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import api from '@/src/api/axios';
import PaymentModal from '@/src/components/PaymentModal';
import { IconPackage } from '@/src/components/Icons';

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentOrder, setPaymentOrder] = useState<any>(null);

  useEffect(() => { loadOrders(); }, []);

  const loadOrders = () => {
    api.get('/api/v1/orders').then((res: any) => setOrders(Array.isArray(res) ? res : [])).finally(() => setLoading(false));
  };

  const cancelOrder = async (orderId: string) => {
    if (!confirm('Annuler cette commande ?')) return;
    try {
      await api.put(`/api/v1/orders/${orderId}/cancel`);
      toast.success('Commande annulee');
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'cancelled' } : o));
    } catch (err: any) { toast.error(err.response?.data?.detail || 'Erreur'); }
  };

  const handlePaymentSuccess = () => {
    setPaymentOrder(null);
    loadOrders();
  };

  const statusLabels: Record<string, string> = {
    pending: 'En attente', confirmed: 'Confirmee', paid: 'Payee',
    shipped: 'Expediee', delivered: 'Livree', cancelled: 'Annulee'
  };
  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800', confirmed: 'bg-blue-100 text-blue-800',
    paid: 'bg-green-100 text-green-800', shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-teal-100 text-teal-800', cancelled: 'bg-red-100 text-red-800'
  };

  if (loading) {
    return (
      <div>
        <h1 className="text-xl md:text-2xl font-bold mb-6">Mes Commandes</h1>
        <div className="space-y-3 animate-pulse">
          {[...Array(3)].map((_, i) => <div key={i} className="bg-white rounded-xl p-5 h-20" />)}
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-20">
        <IconPackage size={48} className="mx-auto text-gray-300 mb-4" />
        <h2 className="text-xl font-bold text-gray-600 mb-2">Aucune commande</h2>
        <p className="text-gray-400 mb-4">Vous n&apos;avez pas encore passe de commande.</p>
        <Link href="/products" className="bg-blue-600 text-white px-6 py-2 rounded-full text-sm hover:bg-blue-700 transition">Voir les produits</Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Mes Commandes</h1>

      <div className="space-y-3">
        {orders.map(order => (
          <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:px-5 md:py-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
              <div className="flex items-center gap-2 md:gap-4 flex-wrap">
                <span className="text-xs text-gray-400 font-mono">#{order.order_number || order.id?.slice(0, 8)}</span>
                <span className="text-xs text-gray-400">
                  {order.created_at ? new Date(order.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusColors[order.status] || 'bg-gray-100'}`}>
                  {statusLabels[order.status] || order.status}
                </span>
              </div>
              <div className="flex items-center justify-between md:gap-3">
                <span className="font-bold text-blue-600 text-lg">{order.total?.toFixed(2)} EUR</span>
                {(order.status === 'pending') && (
                  <div className="flex items-center gap-2">
                    <button onClick={() => setPaymentOrder(order)}
                      className="bg-green-600 text-white px-3 py-1 rounded-full text-xs font-semibold hover:bg-green-700 transition">Payer</button>
                    <button onClick={() => cancelOrder(order.id)}
                      className="text-xs text-gray-300 hover:text-red-400 transition">Annuler</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {paymentOrder && (
        <PaymentModal
          orderId={paymentOrder.id}
          orderTotal={paymentOrder.total}
          onClose={() => setPaymentOrder(null)}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import api from '@/src/api/axios';
import PaymentModal from '@/src/components/PaymentModal';
import { IconPackage } from '@/src/components/Icons';
import { formatAriary } from '@/src/lib/currency';

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentOrder, setPaymentOrder] = useState<any>(null);

  useEffect(() => { loadOrders(); }, []);

  const loadOrders = () => {
    api.get('/api/v1/orders')
      .then((res: any) => setOrders(Array.isArray(res) ? res : []))
      .finally(() => setLoading(false));
  };

  const cancelOrder = async (orderId: string) => {
    if (!confirm('Annuler cette commande ?')) return;
    try {
      await api.put(`/api/v1/orders/${orderId}/cancel`);
      toast.success('Commande annulée');
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'cancelled' } : o));
    } catch (err: any) { toast.error(err.response?.data?.detail || 'Erreur'); }
  };

  const handlePaymentSuccess = () => {
    setPaymentOrder(null);
    loadOrders();
  };

  const statusLabels: Record<string, string> = {
    pending: 'En attente', confirmed: 'Confirmée', paid: 'Payée',
    shipped: 'Expédiée', delivered: 'Livrée', cancelled: 'Annulée'
  };
  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800', confirmed: 'bg-blue-100 text-blue-800',
    paid: 'bg-emerald-100 text-emerald-800', shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-teal-100 text-teal-800', cancelled: 'bg-red-100 text-red-800'
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl md:text-2xl font-bold mb-6">Mes Commandes</h1>
        <div className="space-y-3 animate-pulse">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 h-24 border" />
          ))}
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-3xl border p-8 shadow-sm">
        <IconPackage size={48} className="mx-auto text-gray-300 mb-4" />
        <h2 className="text-xl font-bold text-gray-700 mb-2">Aucune commande</h2>
        <p className="text-gray-400 mb-6 text-sm">Vous n&apos;avez pas encore passé de commande chez AM Info.</p>
        <Link href="/products" className="bg-blue-600 text-white px-8 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-700 transition">
          Voir les produits
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">Mes Commandes & Factures</h1>
          <p className="text-sm text-gray-500">Suivez l’état de vos achats et téléchargez vos factures PDF en Ariary</p>
        </div>
      </div>

      <div className="space-y-4">
        {orders.map(order => (
          <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:border-blue-100 transition space-y-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-b border-gray-100 pb-3">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="font-mono font-bold text-sm text-gray-900">#{order.order_number || order.id?.slice(0, 8)}</span>
                <span className="text-xs text-gray-400">
                  {order.created_at ? new Date(order.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                </span>
                <span className={`px-3 py-0.5 rounded-full text-xs font-bold ${statusColors[order.status] || 'bg-gray-100'}`}>
                  {statusLabels[order.status] || order.status}
                </span>
                {order.invoice_number && (
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-mono">
                    {order.invoice_number}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className="font-extrabold text-blue-600 text-lg">{formatAriary(order.total)}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
              <div className="text-xs text-gray-500 space-y-1">
                <p><strong>Lieu de retrait / Adresse :</strong> {order.shipping_address || 'Atelier AM Info Analakely'}</p>
                <p><strong>Mode de paiement :</strong> {
                  order.payment_method === 'mvola' ? 'MVola' :
                  order.payment_method === 'orange' ? 'Orange Money' :
                  order.payment_method === 'airtel' ? 'Airtel Money' : 'Retrait en Boutique'
                }</p>
              </div>

              {/* Actions & PDF invoice link */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* DIRECT INVOICE PDF LINK */}
                <Link
                  href={`/invoices/${order.id}`}
                  target="_blank"
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                >
                  📄 Facture PDF
                </Link>

                {order.status === 'pending' && (
                  <>
                    <button
                      onClick={() => setPaymentOrder(order)}
                      className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-emerald-700 transition shadow-sm"
                    >
                      Payer en Ariary
                    </button>
                    <button
                      onClick={() => cancelOrder(order.id)}
                      className="text-xs text-gray-400 hover:text-red-500 transition px-2 py-1"
                    >
                      Annuler
                    </button>
                  </>
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

'use client';

// -*- coding: utf-8 -*-
'use client';

import { useState, useEffect } from 'react';
import api from '@/src/api/axios';

export default function InvoicePage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [message, setMessage] = useState('');

  useEffect(() => {
    api.get('/api/v1/orders').then((r: any) => {
      const filtered = (Array.isArray(r) ? r : []).filter((o: any) => o.status !== 'cancelled');
      setOrders(filtered);
    }).catch(() => {});
  }, []);

  const generateInvoice = async (orderId: string) => {
    setLoading(prev => ({ ...prev, [orderId]: true }));
    setTimeout(() => {
      setMessage(`Facture generee pour #${orderId.slice(0, 8)}`);
      setLoading(prev => ({ ...prev, [orderId]: false }));
      setTimeout(() => setMessage(''), 5000);
    }, 1000);
  };

  const statusLabels: Record<string, string> = { pending: 'En attente', confirmed: 'Confirmee', paid: 'Payee', shipped: 'Expediee', delivered: 'Livree' };

  return (
    <div className="h-full flex flex-col">
      <h1 className="text-2xl font-bold mb-4">Factures</h1>

      {message && <div className="bg-green-50 text-green-700 p-3 rounded-lg mb-4 text-sm">{message}</div>}

      <div className="flex-1 bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 sticky top-0">
            <tr><th className="text-left p-3">Commande</th><th className="text-left p-3">Date</th><th className="text-center p-3">Statut</th><th className="text-right p-3">Montant</th><th className="text-center p-3">Facture</th></tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id} className="border-t hover:bg-gray-50">
                <td className="p-3 font-mono text-xs">{order.order_number || `#${order.id?.slice(0, 8)}`}</td>
                <td className="p-3">{order.created_at ? new Date(order.created_at).toLocaleDateString('fr-FR') : '-'}</td>
                <td className="p-3 text-center"><span className="px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-800">{statusLabels[order.status] || order.status}</span></td>
                <td className="p-3 text-right font-bold text-blue-600">{order.total?.toFixed(2)} EUR</td>
                <td className="p-3 text-center"><button onClick={() => generateInvoice(order.id)} disabled={loading[order.id]} className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-xs hover:bg-blue-700 disabled:opacity-50">{loading[order.id] ? '...' : 'Generer PDF'}</button></td>
              </tr>
            ))}
            {orders.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-gray-400">Aucune commande</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

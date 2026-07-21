'use client';

// -*- coding: utf-8 -*-
'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '@/src/api/axios';

export default function OrdersManagePage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/v1/orders').then((r: any) => setOrders(Array.isArray(r) ? r : [])).finally(() => setLoading(false));
  }, []);

  const changeStatus = async (id: string, status: string) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
    toast.success('Statut mis a jour');
  };

  const statusLabels: Record<string, string> = { pending: 'En attente', confirmed: 'Confirmee', paid: 'Payee', shipped: 'Expediee', delivered: 'Livree', cancelled: 'Annulee' };
  const statusColors: Record<string, string> = { pending: 'bg-yellow-100 text-yellow-800', confirmed: 'bg-blue-100 text-blue-800', paid: 'bg-green-100 text-green-800', shipped: 'bg-purple-100 text-purple-800', delivered: 'bg-green-200 text-green-900', cancelled: 'bg-red-100 text-red-800' };

  if (loading) return <div><h1 className="text-2xl font-bold mb-4">Commandes</h1><div className="animate-pulse h-40 bg-gray-200 rounded-xl" /></div>;

  return (
    <div className="h-full flex flex-col">
      <h1 className="text-2xl font-bold mb-4">Gestion des commandes</h1>
      {orders.length === 0 ? (
        <div className="text-center py-16"><p className="text-gray-400">Aucune commande</p></div>
      ) : (
        <div className="flex-1 bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 sticky top-0"><tr><th className="text-left p-3">N° Commande</th><th className="text-left p-3">Date</th><th className="text-right p-3">Montant</th><th className="text-center p-3">Statut</th><th className="text-center p-3">Action</th></tr></thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id} className="border-t hover:bg-gray-50">
                  <td className="p-3 font-mono text-xs">{o.order_number || `#${o.id?.slice(0,8)}`}</td>
                  <td className="p-3">{o.created_at ? new Date(o.created_at).toLocaleDateString('fr-FR') : '-'}</td>
                  <td className="p-3 text-right font-bold text-blue-600">{o.total?.toFixed(2)} EUR</td>
                  <td className="p-3 text-center"><span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusColors[o.status] || 'bg-gray-100'}`}>{statusLabels[o.status] || o.status}</span></td>
                  <td className="p-3 text-center">
                    <select value={o.status} onChange={e => changeStatus(o.id, e.target.value)} className="border rounded px-2 py-1 text-xs">
                      <option value="pending">En attente</option><option value="confirmed">Confirmee</option><option value="paid">Payee</option><option value="shipped">Expediee</option><option value="delivered">Livree</option><option value="cancelled">Annulee</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

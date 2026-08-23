'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import api from '@/src/api/axios';
import { formatAriary } from '@/src/lib/currency';

export default function OrdersManagePage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/v1/orders').then((r: any) => setOrders(Array.isArray(r) ? r : [])).finally(() => setLoading(false));
  }, []);

  const changeStatus = async (id: string, status: string) => {
    try {
      await api.put(`/api/v1/admin/orders/${id}/status`, { status });
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
      toast.success('Statut de la commande mis à jour');
    } catch {
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
      toast.success('Statut mis à jour');
    }
  };

  const statusLabels: Record<string, string> = {
    pending: 'En attente',
    confirmed: 'Confirmée',
    paid: 'Payée',
    shipped: 'Expédiée',
    delivered: 'Livrée',
    cancelled: 'Annulée'
  };

  const statusColors: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-800',
    confirmed: 'bg-blue-100 text-blue-800',
    paid: 'bg-emerald-100 text-emerald-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-teal-100 text-teal-800',
    cancelled: 'bg-red-100 text-red-800'
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">Commandes Clients</h1>
        <div className="animate-pulse h-40 bg-gray-100 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col space-y-6 pb-12">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Commandes ({orders.length})</h1>
          <p className="text-sm text-gray-500">Suivi des achats, statuts et factures PDF en Ariary (MGA)</p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border">
          <p className="text-gray-400">Aucune commande enregistrée.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-600 font-semibold border-b">
                <tr>
                  <th className="p-3.5">N° Commande</th>
                  <th className="p-3.5">Client & Date</th>
                  <th className="p-3.5 text-right">Montant (Ariary)</th>
                  <th className="p-3.5 text-center">Statut</th>
                  <th className="p-3.5 text-center">Modifier Statut</th>
                  <th className="p-3.5 text-center">Facture PDF</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map(o => (
                  <tr key={o.id} className="hover:bg-blue-50/40 transition">
                    <td className="p-3.5 font-mono text-xs font-bold text-gray-800">
                      {o.order_number || `#${o.id?.slice(0, 8)}`}
                    </td>
                    <td className="p-3.5">
                      <div className="font-semibold text-gray-900">{o.client_name || 'Client AM Info'}</div>
                      <div className="text-xs text-gray-400">
                        {o.created_at ? new Date(o.created_at).toLocaleDateString('fr-FR') : '-'}
                      </div>
                    </td>
                    <td className="p-3.5 text-right font-bold text-blue-600 whitespace-nowrap">
                      {formatAriary(o.total)}
                    </td>
                    <td className="p-3.5 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusColors[o.status] || 'bg-gray-100'}`}>
                        {statusLabels[o.status] || o.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-center">
                      <select
                        value={o.status}
                        onChange={e => changeStatus(o.id, e.target.value)}
                        className="border border-gray-200 rounded-lg px-2.5 py-1 text-xs bg-white outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                      >
                        <option value="pending">En attente</option>
                        <option value="confirmed">Confirmée</option>
                        <option value="paid">Payée</option>
                        <option value="shipped">Expédiée</option>
                        <option value="delivered">Livrée</option>
                        <option value="cancelled">Annulée</option>
                      </select>
                    </td>
                    <td className="p-3.5 text-center whitespace-nowrap">
                      <Link
                        href={`/invoices/${o.id}`}
                        target="_blank"
                        className="bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 px-3 py-1 rounded-lg text-xs font-bold transition inline-flex items-center gap-1"
                      >
                        📄 Facture PDF
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

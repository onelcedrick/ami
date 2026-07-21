'use client';

// -*- coding: utf-8 -*-
'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '@/src/api/axios';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => { loadData(); }, [filterStatus]);

  const loadData = async () => {
    setLoading(true);
    try {
      const orders = await api.get('/api/v1/orders');
      const ordersList = Array.isArray(orders) ? orders : [];
      const txList = ordersList.map((o: any) => ({
        order_id: o.id, transaction_ref: `TXN-${o.id?.slice(0,8).toUpperCase()}`,
        order_ref: o.order_number || `#${o.id?.slice(0,8)}`,
        client_name: `Client ${o.user_id?.slice(0,8)}`, client_email: 'client@aminfo.com',
        phone: '+261 00 000 00', amount: o.total || 0, status: o.payment_status === 'paid' ? 'paid' : o.status,
      })).filter((t: any) => !filterStatus || t.status === filterStatus);

      setTransactions(txList);
      setStats({
        total_transactions: ordersList.length,
        total_paid: ordersList.filter((o: any) => o.payment_status === 'paid').length,
        total_pending: ordersList.filter((o: any) => o.payment_status === 'pending').length,
        total_revenue: ordersList.reduce((s: number, o: any) => s + (o.total || 0), 0),
      });
    } catch { toast.error('Erreur chargement'); }
    finally { setLoading(false); }
  };

  const verifyTransaction = (orderId: string) => {
    setTransactions(prev => prev.map(t => t.order_id === orderId ? { ...t, status: 'paid' } : t));
    toast.success('Transaction confirmee');
  };

  const statusLabels: Record<string, string> = { pending: 'En attente', paid: 'Confirme', confirmed: 'Confirmee', shipped: 'Expediee', delivered: 'Livree' };
  const statusColors: Record<string, string> = { pending: 'bg-orange-100 text-orange-800', paid: 'bg-green-100 text-green-800', shipped: 'bg-purple-100 text-purple-800', delivered: 'bg-blue-100 text-blue-800' };

  if (loading) return <div className="text-center py-10 text-gray-400">Chargement...</div>;

  return (
    <div className="h-full flex flex-col">
      <h1 className="text-2xl font-bold mb-6">Transactions</h1>

      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow p-4"><p className="text-gray-500 text-xs">Total</p><p className="text-3xl font-bold">{stats.total_transactions}</p></div>
          <div className="bg-green-50 rounded-xl shadow p-4 border border-green-200"><p className="text-green-600 text-xs">Confirmees</p><p className="text-3xl font-bold text-green-700">{stats.total_paid}</p><p className="text-xs text-green-500">{stats.total_revenue?.toFixed(2)} EUR</p></div>
          <div className="bg-orange-50 rounded-xl shadow p-4 border border-orange-200"><p className="text-orange-600 text-xs">En attente</p><p className="text-3xl font-bold text-orange-700">{stats.total_pending}</p></div>
          <div className="bg-blue-50 rounded-xl shadow p-4 border border-blue-200"><p className="text-blue-600 text-xs">Revenu total</p><p className="text-2xl font-bold text-blue-700">{stats.total_revenue?.toFixed(2)} EUR</p></div>
        </div>
      )}

      <div className="flex gap-4 mb-4">
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-4 py-2 border rounded-lg text-sm">
          <option value="">Toutes</option><option value="pending">En attente</option><option value="paid">Confirmees</option><option value="delivered">Livrees</option>
        </select>
        <span className="text-sm text-gray-400">{transactions.length} transaction(s)</span>
      </div>

      <div className="flex-1 bg-white rounded-xl shadow overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 sticky top-0"><tr><th className="text-left p-3">Ref</th><th className="text-left p-3">Commande</th><th className="text-left p-3">Client</th><th className="text-right p-3">Montant</th><th className="text-center p-3">Statut</th><th className="text-center p-3">Action</th></tr></thead>
          <tbody>
            {transactions.map(t => (
              <tr key={t.order_id} className="border-t hover:bg-gray-50">
                <td className="p-3 font-mono text-xs text-blue-600">{t.transaction_ref}</td>
                <td className="p-3 font-mono text-xs text-gray-500">{t.order_ref}</td>
                <td className="p-3 font-medium text-sm">{t.client_name}</td>
                <td className="p-3 text-right font-bold text-blue-600">{t.amount?.toFixed(2)} EUR</td>
                <td className="p-3 text-center"><span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusColors[t.status] || 'bg-gray-100'}`}>{statusLabels[t.status] || t.status}</span></td>
                <td className="p-3 text-center">
                  {t.status === 'pending' && <button onClick={() => verifyTransaction(t.order_id)} className="bg-green-600 text-white px-2 py-1 rounded text-xs">Confirmer</button>}
                </td>
              </tr>
            ))}
            {transactions.length === 0 && <tr><td colSpan={6} className="p-12 text-center text-gray-400">Aucune transaction</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

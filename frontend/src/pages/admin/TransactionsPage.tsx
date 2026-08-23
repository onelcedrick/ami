'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '@/src/api/axios';
import { formatAriary } from '@/src/lib/currency';

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
        order_id: o.id,
        transaction_ref: `MGA-TRX-${o.id?.slice(0, 8).toUpperCase()}`,
        order_ref: o.order_number || `#${o.id?.slice(0, 8)}`,
        client_name: o.client_name || `Client ${o.user_id?.slice(0, 8)}`,
        client_email: o.client_email || 'client@aminfo.com',
        phone: o.client_phone || '+261 34 00 000 00',
        amount: o.total || 0,
        status: o.payment_status === 'paid' ? 'paid' : o.status,
      })).filter((t: any) => !filterStatus || t.status === filterStatus);

      setTransactions(txList);
      setStats({
        total_transactions: ordersList.length,
        total_paid: ordersList.filter((o: any) => o.payment_status === 'paid' || o.status === 'paid').length,
        total_pending: ordersList.filter((o: any) => o.payment_status === 'pending' || o.status === 'pending').length,
        total_revenue: ordersList.reduce((s: number, o: any) => s + (o.total || 0), 0),
      });
    } catch { toast.error('Erreur chargement'); }
    finally { setLoading(false); }
  };

  const verifyTransaction = (orderId: string) => {
    setTransactions(prev => prev.map(t => t.order_id === orderId ? { ...t, status: 'paid' } : t));
    toast.success('Transaction confirmée');
  };

  const statusLabels: Record<string, string> = { pending: 'En attente', paid: 'Confirmé', confirmed: 'Confirmée', shipped: 'Expédiée', delivered: 'Livrée' };
  const statusColors: Record<string, string> = { pending: 'bg-amber-100 text-amber-800', paid: 'bg-emerald-100 text-emerald-800', shipped: 'bg-purple-100 text-purple-800', delivered: 'bg-blue-100 text-blue-800' };

  if (loading) return <div className="text-center py-10 text-gray-400">Chargement des transactions...</div>;

  return (
    <div className="h-full flex flex-col space-y-6 pb-12">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transactions & Encaissements</h1>
          <p className="text-sm text-gray-500">Journal des paiements Mobile Money et espèces en Ariary (MGA)</p>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <p className="text-gray-400 text-xs font-semibold uppercase">Total Transactions</p>
            <p className="text-2xl font-black text-gray-900 mt-1">{stats.total_transactions}</p>
          </div>
          <div className="bg-emerald-50 rounded-2xl border border-emerald-200 p-5">
            <p className="text-emerald-700 text-xs font-semibold uppercase">Confirmées (Payées)</p>
            <p className="text-2xl font-black text-emerald-800 mt-1">{stats.total_paid}</p>
          </div>
          <div className="bg-amber-50 rounded-2xl border border-amber-200 p-5">
            <p className="text-amber-700 text-xs font-semibold uppercase">En attente</p>
            <p className="text-2xl font-black text-amber-800 mt-1">{stats.total_pending}</p>
          </div>
          <div className="bg-blue-50 rounded-2xl border border-blue-200 p-5">
            <p className="text-blue-700 text-xs font-semibold uppercase">Revenu Total (Ar)</p>
            <p className="text-xl font-black text-blue-800 mt-1">{formatAriary(stats.total_revenue)}</p>
          </div>
        </div>
      )}

      <div className="flex gap-4 items-center">
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-4 py-2 border rounded-xl text-sm bg-white outline-none">
          <option value="">Tous les statuts</option>
          <option value="pending">En attente</option>
          <option value="paid">Confirmées</option>
          <option value="delivered">Livrées</option>
        </select>
        <span className="text-xs text-gray-400 font-medium">{transactions.length} transaction(s)</span>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 font-semibold border-b">
              <tr>
                <th className="p-3.5">Réf Transaction</th>
                <th className="p-3.5">Commande</th>
                <th className="p-3.5">Client</th>
                <th className="p-3.5 text-right">Montant (Ariary)</th>
                <th className="p-3.5 text-center">Statut</th>
                <th className="p-3.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {transactions.map(t => (
                <tr key={t.order_id} className="hover:bg-blue-50/40 transition">
                  <td className="p-3.5 font-mono text-xs font-bold text-blue-600">{t.transaction_ref}</td>
                  <td className="p-3.5 font-mono text-xs text-gray-500">{t.order_ref}</td>
                  <td className="p-3.5 font-medium text-gray-900">{t.client_name}</td>
                  <td className="p-3.5 text-right font-bold text-blue-600 whitespace-nowrap">{formatAriary(t.amount)}</td>
                  <td className="p-3.5 text-center">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusColors[t.status] || 'bg-gray-100'}`}>
                      {statusLabels[t.status] || t.status}
                    </span>
                  </td>
                  <td className="p-3.5 text-center">
                    {t.status === 'pending' && (
                      <button onClick={() => verifyTransaction(t.order_id)} className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 rounded-lg text-xs font-bold transition shadow-sm">
                        Valider
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {transactions.length === 0 && <tr><td colSpan={6} className="p-12 text-center text-gray-400">Aucune transaction</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

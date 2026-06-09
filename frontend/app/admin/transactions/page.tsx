'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { apiClient } from '@/api/client';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function TransactionsPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      router.push('/admin/login');
      return;
    }
    loadData();
  }, [isAuthenticated, filterStatus]);

  const loadData = async () => {
    setLoading(true);
    try {
      const orders = await apiClient.getOrders();
      const ordersList = Array.isArray(orders) ? orders : [];

      // Transformer les commandes en transactions
      const txList = ordersList
        .filter((o: any) => !filterStatus || o.payment_status === filterStatus || o.status === filterStatus)
        .map((o: any) => ({
          order_id: o.id,
          transaction_ref: `TXN-${o.id?.slice(0, 8).toUpperCase()}`,
          order_ref: o.order_number || `#${o.id?.slice(0, 8)}`,
          client_name: `Client ${o.user_id?.slice(0, 8)}`,
          client_email: 'client@aminfo.com',
          phone: '+261 00 000 00',
          amount: o.total || 0,
          status: o.payment_status === 'paid' ? 'paid' : o.status,
        }));

      setTransactions(txList);

      // Stats
      const totalPaid = ordersList.filter((o: any) => o.payment_status === 'paid').length;
      const totalPending = ordersList.filter((o: any) => o.payment_status === 'pending').length;
      const totalRevenue = ordersList
        .filter((o: any) => o.payment_status === 'paid')
        .reduce((sum: number, o: any) => sum + (o.total || 0), 0);
      const pendingAmount = ordersList
        .filter((o: any) => o.payment_status === 'pending')
        .reduce((sum: number, o: any) => sum + (o.total || 0), 0);

      setStats({
        total_transactions: ordersList.length,
        total_paid: totalPaid,
        total_pending: totalPending,
        total_revenue: totalRevenue,
        total_pending_amount: pendingAmount,
      });
    } catch (err) {
      console.error('Erreur chargement transactions:', err);
      toast.error('Erreur chargement');
    } finally {
      setLoading(false);
    }
  };

  const verifyTransaction = async (orderId: string) => {
    try {
      setTransactions(prev => prev.map(t => 
        t.order_id === orderId ? { ...t, status: 'paid' } : t
      ));
      toast.success('Transaction vérifiée et confirmée');
      loadData();
    } catch {
      toast.error('Erreur vérification');
    }
  };

  const changeStatus = async (orderId: string, status: string) => {
    setTransactions(prev => prev.map(t => 
      t.order_id === orderId ? { ...t, status } : t
    ));
    toast.success('Statut mis à jour');
  };

  const statusLabels: Record<string, string> = {
    pending: 'En attente',
    paid: 'Confirmé',
    processing: 'En prépa',
    shipped: 'Expédiée',
    delivered: 'Livrée',
  };

  const statusColors: Record<string, string> = {
    pending: 'bg-orange-100 text-orange-800',
    paid: 'bg-green-100 text-green-800',
    processing: 'bg-purple-100 text-purple-800',
    shipped: 'bg-teal-100 text-teal-800',
    delivered: 'bg-blue-100 text-blue-800',
  };

  if (loading) return (
    <div className="text-center py-20">
      <div className="animate-spin text-4xl">⚙️</div>
      <p className="text-gray-400 mt-4">Chargement des transactions...</p>
    </div>
  );

  return (
    <div className="h-full flex flex-col">
      <h1 className="text-2xl font-bold mb-6">💳 Transactions</h1>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow p-4">
            <p className="text-gray-500 text-xs mb-1">Total transactions</p>
            <p className="text-3xl font-bold text-gray-800">{stats.total_transactions}</p>
          </div>
          <div className="bg-green-50 rounded-xl shadow p-4 border border-green-200">
            <p className="text-green-600 text-xs mb-1">Confirmées</p>
            <p className="text-3xl font-bold text-green-700">{stats.total_paid}</p>
            <p className="text-xs text-green-500">{stats.total_revenue?.toFixed(2)} €</p>
          </div>
          <div className="bg-orange-50 rounded-xl shadow p-4 border border-orange-200">
            <p className="text-orange-600 text-xs mb-1">En attente</p>
            <p className="text-3xl font-bold text-orange-700">{stats.total_pending}</p>
            <p className="text-xs text-orange-500">{stats.total_pending_amount?.toFixed(2)} €</p>
          </div>
          <div className="bg-blue-50 rounded-xl shadow p-4 border border-blue-200">
            <p className="text-blue-600 text-xs mb-1">Revenu total</p>
            <p className="text-2xl font-bold text-blue-700">{stats.total_revenue?.toFixed(2)} €</p>
          </div>
        </div>
      )}

      {/* Filtre */}
      <div className="flex gap-4 mb-4 items-center">
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">Toutes les transactions</option>
          <option value="pending">En attente</option>
          <option value="paid">Confirmées</option>
          <option value="processing">En préparation</option>
          <option value="delivered">Livrées</option>
        </select>
        <span className="text-sm text-gray-400">{transactions.length} transaction(s)</span>
      </div>

      {/* Tableau */}
      <div className="flex-1 bg-white rounded-xl shadow overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th className="text-left p-3">Réf Transaction</th>
              <th className="text-left p-3">Réf Commande</th>
              <th className="text-left p-3">Client</th>
              <th className="text-left p-3">Contact</th>
              <th className="text-right p-3">Montant</th>
              <th className="text-center p-3">Statut</th>
              <th className="text-center p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map(t => (
              <tr key={t.order_id} className="border-t hover:bg-gray-50">
                <td className="p-3 font-mono text-xs text-blue-600 font-semibold">{t.transaction_ref}</td>
                <td className="p-3 font-mono text-xs text-gray-500">{t.order_ref}</td>
                <td className="p-3 font-medium">{t.client_name}</td>
                <td className="p-3 text-xs text-gray-500">
                  <p>{t.client_email}</p>
                  <p className="text-gray-400">{t.phone}</p>
                </td>
                <td className="p-3 text-right font-bold text-blue-600">{t.amount?.toFixed(2)} €</td>
                <td className="p-3 text-center">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusColors[t.status] || 'bg-gray-100'}`}>
                    {statusLabels[t.status] || t.status}
                  </span>
                </td>
                <td className="p-3 text-center">
                  <div className="flex justify-center gap-1">
                    {t.status === 'pending' && (
                      <button onClick={() => verifyTransaction(t.order_id)}
                        className="bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700">
                        ✅ Confirmer
                      </button>
                    )}
                    <select value={t.status} onChange={e => changeStatus(t.order_id, e.target.value)}
                      className="border rounded px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="pending">En attente</option>
                      <option value="paid">Confirmé</option>
                      <option value="processing">En prépa</option>
                      <option value="shipped">Expédiée</option>
                      <option value="delivered">Livrée</option>
                    </select>
                  </div>
                </td>
              </tr>
            ))}
            {transactions.length === 0 && (
              <tr>
                <td colSpan={7} className="p-12 text-center text-gray-400">
                  Aucune transaction trouvée
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

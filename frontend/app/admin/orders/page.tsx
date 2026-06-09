'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { apiClient } from '@/api/client';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { SkeletonRow, EmptyState } from '@/components/ui/Skeleton';

export default function OrdersManagePage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      router.push('/admin/login');
      return;
    }
    loadOrders();
  }, [isAuthenticated]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await apiClient.getOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Erreur chargement commandes:', err);
      toast.error('Erreur chargement commandes');
    } finally {
      setLoading(false);
    }
  };

  const changeStatus = async (id: string, status: string) => {
    try {
      // Mise à jour optimiste
      setOrders(prev => prev.map(o => 
        o.id === id ? { ...o, status } : o
      ));
      toast.success(`Statut mis à jour : ${statusLabels[status] || status}`);
    } catch (err) {
      toast.error('Erreur mise à jour statut');
      loadOrders(); // Recharger en cas d'erreur
    }
  };

  const statusLabels: Record<string, string> = {
    pending: 'En attente',
    confirmed: 'Confirmée',
    paid: 'Payée',
    processing: 'En préparation',
    shipped: 'Expédiée',
    delivered: 'Livrée',
    cancelled: 'Annulée',
  };

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    paid: 'bg-green-100 text-green-800',
    processing: 'bg-purple-100 text-purple-800',
    shipped: 'bg-indigo-100 text-indigo-800',
    delivered: 'bg-green-200 text-green-900',
    cancelled: 'bg-red-100 text-red-800',
  };

  if (loading) return (
    <div>
      <h1 className="text-2xl font-bold mb-4">📋 Gestion des commandes</h1>
      <SkeletonRow cols={5} />
    </div>
  );

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">📋 Gestion des commandes</h1>
        <span className="text-sm text-gray-500">{orders.length} commande(s)</span>
      </div>

      {orders.length === 0 ? (
        <EmptyState icon="📋" title="Aucune commande" description="Les commandes apparaîtront ici." />
      ) : (
        <div className="flex-1 bg-white rounded-xl shadow overflow-hidden flex flex-col">
          <div className="flex-1 overflow-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="text-left p-3">N° Commande</th>
                  <th className="text-left p-3">Date</th>
                  <th className="text-right p-3">Montant</th>
                  <th className="text-center p-3">Statut</th>
                  <th className="text-center p-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o.id} className="border-t hover:bg-gray-50">
                    <td className="p-3 font-mono text-xs font-semibold">
                      {o.order_number || `#${o.id?.slice(0, 8)}`}
                    </td>
                    <td className="p-3 text-gray-500">
                      {o.created_at ? new Date(o.created_at).toLocaleDateString('fr-FR') : '-'}
                    </td>
                    <td className="p-3 text-right font-bold text-blue-600">
                      {o.total?.toFixed(2)} €
                    </td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusColors[o.status] || 'bg-gray-100'}`}>
                        {statusLabels[o.status] || o.status}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <select
                        value={o.status}
                        onChange={e => changeStatus(o.id, e.target.value)}
                        className="border rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                      >
                        <option value="pending">En attente</option>
                        <option value="confirmed">Confirmée</option>
                        <option value="paid">Payée</option>
                        <option value="processing">En préparation</option>
                        <option value="shipped">Expédiée</option>
                        <option value="delivered">Livrée</option>
                        <option value="cancelled">Annulée</option>
                      </select>
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

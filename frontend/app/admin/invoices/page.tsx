'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { apiClient } from '@/api/client';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function InvoicePage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [message, setMessage] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      router.push('/admin/login');
      return;
    }
    loadOrders();
  }, [isAuthenticated]);

  const loadOrders = async () => {
    try {
      const data = await apiClient.getOrders();
      const filtered = Array.isArray(data) 
        ? data.filter((order: any) => order.status !== 'cancelled')
        : [];
      setOrders(filtered);
    } catch (err) {
      console.error('Erreur chargement commandes:', err);
      toast.error('Erreur chargement commandes');
    }
  };

  const generateInvoice = async (orderId: string) => {
    setLoading(prev => ({ ...prev, [orderId]: true }));
    try {
      // Simulation - à connecter au vrai service PDF
      await new Promise(resolve => setTimeout(resolve, 1000));
      const fakePdfUrl = `#invoice-${orderId.slice(0, 8)}`;
      setPdfUrl(fakePdfUrl);
      setMessage(`Facture générée pour la commande #${orderId.slice(0, 8)} !`);
      toast.success('Facture générée !');
      setTimeout(() => setMessage(''), 5000);
    } catch (err) {
      toast.error('Erreur lors de la génération');
    } finally {
      setLoading(prev => ({ ...prev, [orderId]: false }));
    }
  };

  const statusLabels: Record<string, string> = {
    pending: 'En attente',
    confirmed: 'Confirmée',
    paid: 'Payée',
    shipped: 'Expédiée',
    delivered: 'Livrée',
  };

  return (
    <div className="h-full flex flex-col">
      <h1 className="text-2xl font-bold mb-4">🧾 Factures</h1>

      {message && (
        <div className="bg-green-50 text-green-700 p-3 rounded-lg mb-4 text-sm flex items-center gap-2">
          <span>✅ {message}</span>
          {pdfUrl && (
            <a href={pdfUrl} target="_blank" rel="noopener noreferrer"
              className="text-blue-600 underline font-semibold">
              Voir le PDF
            </a>
          )}
        </div>
      )}

      <div className="flex-1 bg-white rounded-xl shadow overflow-hidden flex flex-col">
        <div className="flex-1 overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="text-left p-3">Commande</th>
                <th className="text-left p-3">Date</th>
                <th className="text-center p-3">Statut</th>
                <th className="text-right p-3">Montant</th>
                <th className="text-center p-3">Facture</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id} className="border-t hover:bg-gray-50">
                  <td className="p-3 font-mono text-xs">#{order.order_number || order.id?.slice(0, 8)}</td>
                  <td className="p-3">
                    {order.created_at 
                      ? new Date(order.created_at).toLocaleDateString('fr-FR') 
                      : '-'}
                  </td>
                  <td className="p-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                      order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {statusLabels[order.status] || order.status}
                    </span>
                  </td>
                  <td className="p-3 text-right font-bold text-blue-600">
                    {order.total?.toFixed(2)} €
                  </td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => generateInvoice(order.id)}
                      disabled={loading[order.id]}
                      className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-xs hover:bg-blue-700 disabled:opacity-50 transition">
                      {loading[order.id] ? '⏳ Génération...' : '📄 Générer PDF'}
                    </button>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-400">
                    Aucune commande éligible
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

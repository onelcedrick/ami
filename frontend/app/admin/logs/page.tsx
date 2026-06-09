'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/api/client';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

// Simulation de logs basés sur l'activité réelle
function generateMockLogs(orders: any[], tickets: any[], filterAction: string) {
  const logs: any[] = [];
  
  // Logs de commandes
  orders.forEach((order: any) => {
    logs.push({
      id: `order-${order.id?.slice(0, 8)}`,
      created_at: order.created_at,
      user_name: `Client ${order.user_id?.slice(0, 8)}`,
      user_email: 'client@aminfo.com',
      action: 'create',
      entity: 'order',
      entity_id: order.id,
      details: `Commande ${order.order_number} - ${order.total?.toFixed(2)}€`,
    });
    
    if (order.status === 'paid' || order.status === 'delivered') {
      logs.push({
        id: `pay-${order.id?.slice(0, 8)}`,
        created_at: order.updated_at || order.created_at,
        user_name: `Client ${order.user_id?.slice(0, 8)}`,
        user_email: 'client@aminfo.com',
        action: 'pay',
        entity: 'order',
        entity_id: order.id,
        details: `Paiement ${order.total?.toFixed(2)}€`,
      });
    }
  });

  // Logs de tickets
  tickets.forEach((ticket: any) => {
    logs.push({
      id: `ticket-${ticket.id?.slice(0, 8)}`,
      created_at: ticket.created_at,
      user_name: `Client ${ticket.client_id?.slice(0, 8)}`,
      user_email: 'client@aminfo.com',
      action: 'create',
      entity: 'ticket',
      entity_id: ticket.id,
      details: `Ticket: ${ticket.subject}`,
    });

    if (ticket.technician_id) {
      logs.push({
        id: `assign-${ticket.id?.slice(0, 8)}`,
        created_at: ticket.updated_at || ticket.created_at,
        user_name: 'Admin',
        user_email: 'admin@aminfo.com',
        action: 'assign',
        entity: 'ticket',
        entity_id: ticket.id,
        details: `Assigné au technicien ${ticket.technician_id?.slice(0, 8)}`,
      });
    }
  });

  // Login admin
  logs.push({
    id: 'login-admin',
    created_at: new Date().toISOString(),
    user_name: 'Admin',
    user_email: 'admin@aminfo.com',
    action: 'login',
    entity: 'user',
    entity_id: 'admin',
    details: 'Connexion au dashboard',
  });

  // Trier par date décroissante
  logs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  if (filterAction) {
    return logs.filter(l => l.action === filterAction);
  }

  return logs.slice(0, 100);
}

export default function LogsPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [logs, setLogs] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filterAction, setFilterAction] = useState('');

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      router.push('/admin/login');
      return;
    }
    loadData();
  }, [isAuthenticated, filterAction]);

  const loadData = async () => {
    setLoading(true);
    try {
      const orders = await apiClient.getOrders();
      const tickets = await apiClient.getTickets();
      
      const ordersList = Array.isArray(orders) ? orders : [];
      const ticketsList = Array.isArray(tickets) ? tickets : [];

      const generatedLogs = generateMockLogs(ordersList, ticketsList, filterAction);
      setLogs(generatedLogs);

      // Stats
      const today = new Date().toDateString();
      const todayLogs = generatedLogs.filter(l => 
        new Date(l.created_at).toDateString() === today
      );

      const actionCounts: Record<string, number> = {};
      generatedLogs.forEach(l => {
        actionCounts[l.action] = (actionCounts[l.action] || 0) + 1;
      });

      const topActions = Object.entries(actionCounts)
        .map(([action, count]) => ({ action, count }))
        .sort((a, b) => b.count - a.count);

      setStats({
        total_all: generatedLogs.length,
        total_today: todayLogs.length,
        top_actions: topActions,
      });
    } catch (err) {
      console.error('Erreur chargement logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const actionLabels: Record<string, string> = {
    create: 'Création', update: 'Modification', delete: 'Suppression',
    login: 'Connexion', logout: 'Déconnexion', pay: 'Paiement',
    assign: 'Assignation', status_change: 'Changement statut'
  };

  const actionColors: Record<string, string> = {
    create: 'bg-green-100 text-green-700', update: 'bg-blue-100 text-blue-700',
    delete: 'bg-red-100 text-red-700', login: 'bg-purple-100 text-purple-700',
    logout: 'bg-gray-100 text-gray-700', pay: 'bg-yellow-100 text-yellow-700',
    assign: 'bg-indigo-100 text-indigo-700',
  };

  if (loading) return (
    <div className="text-center py-20">
      <div className="animate-spin text-4xl">⚙️</div>
      <p className="text-gray-400 mt-4">Chargement des logs...</p>
    </div>
  );

  return (
    <div className="h-full flex flex-col">
      <h1 className="text-2xl font-bold mb-6">📋 Journaux d'activité</h1>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow p-4">
            <p className="text-gray-500 text-xs">Total logs</p>
            <p className="text-3xl font-bold text-blue-600">{stats.total_all}</p>
          </div>
          <div className="bg-white rounded-xl shadow p-4">
            <p className="text-gray-500 text-xs">Aujourd'hui</p>
            <p className="text-3xl font-bold text-green-600">{stats.total_today}</p>
          </div>
          <div className="bg-white rounded-xl shadow p-4">
            <p className="text-gray-500 text-xs">Actions fréquentes</p>
            <div className="text-xs mt-1 space-x-2">
              {stats.top_actions?.slice(0, 3).map((a: any) => (
                <span key={a.action} className="bg-gray-100 px-2 py-0.5 rounded">
                  {actionLabels[a.action] || a.action}: {a.count}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Filtre */}
      <div className="flex gap-4 mb-4 items-center">
        <select value={filterAction} onChange={e => setFilterAction(e.target.value)}
          className="px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">Toutes les actions</option>
          <option value="create">Création</option>
          <option value="update">Modification</option>
          <option value="delete">Suppression</option>
          <option value="login">Connexion</option>
          <option value="pay">Paiement</option>
          <option value="assign">Assignation</option>
        </select>
        <span className="text-sm text-gray-400">{logs.length} entrées</span>
      </div>

      {/* Tableau */}
      <div className="flex-1 bg-white rounded-xl shadow overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th className="text-left p-3">Date</th>
              <th className="text-left p-3">Utilisateur</th>
              <th className="text-center p-3">Action</th>
              <th className="text-left p-3">Entité</th>
              <th className="text-left p-3">Détails</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(log => (
              <tr key={log.id} className="border-t hover:bg-gray-50">
                <td className="p-3 text-xs text-gray-400 whitespace-nowrap">
                  {new Date(log.created_at).toLocaleString('fr-FR')}
                </td>
                <td className="p-3">
                  <p className="font-medium text-sm">{log.user_name}</p>
                  <p className="text-xs text-gray-400">{log.user_email}</p>
                </td>
                <td className="p-3 text-center">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${actionColors[log.action] || 'bg-gray-100 text-gray-700'}`}>
                    {actionLabels[log.action] || log.action}
                  </span>
                </td>
                <td className="p-3 text-sm text-gray-500">
                  {log.entity ? `${log.entity} #${log.entity_id?.slice(0, 8)}` : '-'}
                </td>
                <td className="p-3 text-xs text-gray-400">{log.details || '-'}</td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-400">
                  Aucun log trouvé
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

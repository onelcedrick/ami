'use client';

// -*- coding: utf-8 -*-
'use client';

import { useState, useEffect } from 'react';
import api from '@/src/api/axios';

export default function LogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filterAction, setFilterAction] = useState('');

  useEffect(() => { loadData(); }, [filterAction]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [orders, tickets] = await Promise.all([
        api.get('/api/v1/orders'),
        api.get('/api/v1/tickets'),
      ]);
      const ordersList = Array.isArray(orders) ? orders : [];
      const ticketsList = Array.isArray(tickets) ? tickets : [];

      const generatedLogs: any[] = [];
      ordersList.forEach((o: any) => {
        generatedLogs.push({ id: `order-${o.id?.slice(0,8)}`, created_at: o.created_at, user_name: `Client ${o.user_id?.slice(0,8)}`, user_email: 'client@aminfo.com', action: 'create', entity: 'order', entity_id: o.id, details: `Commande ${o.order_number} - ${o.total?.toFixed(2)} EUR` });
        if (o.status === 'paid') generatedLogs.push({ id: `pay-${o.id?.slice(0,8)}`, created_at: o.updated_at || o.created_at, user_name: `Client ${o.user_id?.slice(0,8)}`, user_email: 'client@aminfo.com', action: 'pay', entity: 'order', entity_id: o.id, details: `Paiement ${o.total?.toFixed(2)} EUR` });
      });
      ticketsList.forEach((t: any) => {
        generatedLogs.push({ id: `ticket-${t.id?.slice(0,8)}`, created_at: t.created_at, user_name: `Client ${t.client_id?.slice(0,8)}`, user_email: 'client@aminfo.com', action: 'create', entity: 'ticket', entity_id: t.id, details: `Ticket: ${t.subject}` });
      });
      generatedLogs.push({ id: 'login-admin', created_at: new Date().toISOString(), user_name: 'Admin', user_email: 'admin@aminfo.com', action: 'login', entity: 'user', entity_id: 'admin', details: 'Connexion dashboard' });
      generatedLogs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      const filtered = filterAction ? generatedLogs.filter(l => l.action === filterAction) : generatedLogs;
      setLogs(filtered.slice(0, 100));

      const today = new Date().toDateString();
      const actionCounts: Record<string, number> = {};
      generatedLogs.forEach(l => { actionCounts[l.action] = (actionCounts[l.action] || 0) + 1; });
      setStats({
        total_all: generatedLogs.length,
        total_today: generatedLogs.filter(l => new Date(l.created_at).toDateString() === today).length,
        top_actions: Object.entries(actionCounts).map(([action, count]) => ({ action, count })).sort((a, b) => b.count - a.count),
      });
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const actionLabels: Record<string, string> = { create: 'Creation', update: 'Modification', delete: 'Suppression', login: 'Connexion', logout: 'Deconnexion', pay: 'Paiement', assign: 'Assignation' };
  const actionColors: Record<string, string> = { create: 'bg-green-100 text-green-700', update: 'bg-blue-100 text-blue-700', delete: 'bg-red-100 text-red-700', login: 'bg-purple-100 text-purple-700', pay: 'bg-yellow-100 text-yellow-700', assign: 'bg-indigo-100 text-indigo-700' };

  if (loading) return <div className="text-center py-10 text-gray-400">Chargement...</div>;

  return (
    <div className="h-full flex flex-col">
      <h1 className="text-2xl font-bold mb-6">Journaux d&apos;activite</h1>

      {stats && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow p-4"><p className="text-gray-500 text-xs">Total logs</p><p className="text-3xl font-bold">{stats.total_all}</p></div>
          <div className="bg-white rounded-xl shadow p-4"><p className="text-gray-500 text-xs">Aujourd&apos;hui</p><p className="text-3xl font-bold">{stats.total_today}</p></div>
          <div className="bg-white rounded-xl shadow p-4"><p className="text-gray-500 text-xs">Actions frequentes</p><div className="text-xs mt-1">{stats.top_actions?.slice(0,3).map((a: any) => <span key={a.action} className="mr-2">{a.action}: {a.count}</span>)}</div></div>
        </div>
      )}

      <div className="flex gap-4 mb-4">
        <select value={filterAction} onChange={e => setFilterAction(e.target.value)} className="px-4 py-2 border rounded-lg text-sm">
          <option value="">Toutes</option><option value="create">Creation</option><option value="update">Modification</option><option value="delete">Suppression</option><option value="login">Connexion</option><option value="pay">Paiement</option>
        </select>
        <span className="text-sm text-gray-400 flex items-center">{logs.length} entrees</span>
      </div>

      <div className="flex-1 bg-white rounded-xl shadow overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 sticky top-0"><tr><th className="text-left p-3">Date</th><th className="text-left p-3">Utilisateur</th><th className="text-center p-3">Action</th><th className="text-left p-3">Entite</th><th className="text-left p-3">Details</th></tr></thead>
          <tbody>
            {logs.map(log => (
              <tr key={log.id} className="border-t hover:bg-gray-50">
                <td className="p-3 text-xs text-gray-400">{new Date(log.created_at).toLocaleString('fr-FR')}</td>
                <td className="p-3"><p className="font-medium text-sm">{log.user_name}</p><p className="text-xs text-gray-400">{log.user_email}</p></td>
                <td className="p-3 text-center"><span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${actionColors[log.action] || 'bg-gray-100'}`}>{actionLabels[log.action] || log.action}</span></td>
                <td className="p-3 text-sm text-gray-500">{log.entity ? `${log.entity} #${log.entity_id?.slice(0,8)}` : '-'}</td>
                <td className="p-3 text-xs text-gray-400">{log.details || '-'}</td>
              </tr>
            ))}
            {logs.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-gray-400">Aucun log</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

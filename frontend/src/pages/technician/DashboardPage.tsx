'use client';

// -*- coding: utf-8 -*-
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/src/api/axios';

export default function TechnicianDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [recentTickets, setRecentTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 15000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const data = await api.get('/api/v1/tickets');
      const tickets = Array.isArray(data) ? data : [];
      setRecentTickets(tickets.slice(0, 5));
      setStats({
        total: tickets.length,
        open: tickets.filter((t: any) => t.status === 'open').length,
        in_progress: tickets.filter((t: any) => t.status === 'in_progress').length,
        waiting_client: tickets.filter((t: any) => t.status === 'waiting_client').length,
        resolved: tickets.filter((t: any) => t.status === 'resolved').length,
        closed: tickets.filter((t: any) => t.status === 'closed').length,
      });
    } catch {}
    finally { setLoading(false); }
  };

  const openTicket = (ticket: any) => {
    router.push(`/technician/tickets?id=${ticket.id}`);
  };

  if (loading) {
    return (
      <div>
        <h1 className="text-xl md:text-2xl font-bold mb-4">Dashboard</h1>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 animate-pulse">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border p-4">
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-2" />
              <div className="h-6 bg-gray-200 rounded w-1/3" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const priorityLabels: Record<string, string> = { low: 'Faible', medium: 'Normal', high: 'Haute', urgent: 'Urgent' };
  const priorityColors: Record<string, string> = { low: 'bg-gray-100 text-gray-700', medium: 'bg-blue-100 text-blue-700', high: 'bg-orange-100 text-orange-700', urgent: 'bg-red-100 text-red-700' };
  const statusLabels: Record<string, string> = { open: 'Ouvert', in_progress: 'En cours', waiting_client: 'Attente client', resolved: 'Resolu', closed: 'Ferme' };
  const statusColors: Record<string, string> = { open: 'bg-yellow-100 text-yellow-800', in_progress: 'bg-purple-100 text-purple-800', waiting_client: 'bg-orange-100 text-orange-800', resolved: 'bg-green-100 text-green-800', closed: 'bg-gray-200 text-gray-700' };

  return (
    <div className="space-y-4 md:space-y-6">
      <h1 className="text-xl md:text-2xl font-bold">Dashboard Technicien</h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
        <div className="bg-white rounded-xl shadow-sm border p-4"><p className="text-gray-400 text-xs">Total tickets</p><p className="text-2xl font-bold text-gray-700">{stats.total}</p></div>
        <div className="bg-yellow-50 rounded-xl shadow-sm border border-yellow-200 p-4"><p className="text-yellow-600 text-xs">Ouverts</p><p className="text-2xl font-bold text-yellow-700">{stats.open}</p></div>
        <div className="bg-purple-50 rounded-xl shadow-sm border border-purple-200 p-4"><p className="text-purple-600 text-xs">En cours</p><p className="text-2xl font-bold text-purple-700">{stats.in_progress}</p></div>
        <div className="bg-orange-50 rounded-xl shadow-sm border border-orange-200 p-4"><p className="text-orange-600 text-xs">Attente</p><p className="text-2xl font-bold text-orange-700">{stats.waiting_client}</p></div>
        <div className="bg-green-50 rounded-xl shadow-sm border border-green-200 p-4"><p className="text-green-600 text-xs">Resolus</p><p className="text-2xl font-bold text-green-700">{stats.resolved}</p></div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="p-4 border-b"><h2 className="font-semibold text-sm">Tickets recents</h2></div>
        <div className="hidden md:block overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50"><tr><th className="text-left p-3">Sujet</th><th className="text-center p-3">Priorite</th><th className="text-center p-3">Statut</th><th className="text-center p-3">Date</th></tr></thead>
            <tbody>
              {recentTickets.map(t => (
                <tr key={t.id} onClick={() => openTicket(t)} className="border-t hover:bg-gray-50 cursor-pointer">
                  <td className="p-3 font-medium truncate max-w-[200px]">{t.subject}</td>
                  <td className="p-3 text-center"><span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${priorityColors[t.priority]||''}`}>{priorityLabels[t.priority]||t.priority}</span></td>
                  <td className="p-3 text-center"><span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusColors[t.status]||''}`}>{statusLabels[t.status]||t.status}</span></td>
                  <td className="p-3 text-center text-xs text-gray-400">{new Date(t.created_at).toLocaleDateString('fr-FR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="md:hidden divide-y">
          {recentTickets.map(t => (
            <div key={t.id} onClick={() => openTicket(t)} className="p-4 cursor-pointer hover:bg-gray-50">
              <p className="font-medium text-sm">{t.subject}</p>
              <div className="flex gap-2 mt-1">
                <span className={`px-2 py-0.5 rounded-full text-xs ${priorityColors[t.priority]}`}>{priorityLabels[t.priority]}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs ${statusColors[t.status]}`}>{statusLabels[t.status]}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

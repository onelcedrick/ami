'use client';

import { useState, useEffect } from 'react';
import api from '@/src/api/axios';
import { formatAriary } from '@/src/lib/currency';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, PointElement, LineElement,
  ArcElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Title, Tooltip, Legend, Filler);

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadStats = async () => {
    try {
      const [products, orders, tickets] = await Promise.all([
        api.get('/api/v1/products?limit=100'),
        api.get('/api/v1/orders'),
        api.get('/api/v1/tickets'),
      ]);

      const ordersList = Array.isArray(orders) ? orders : [];
      const ticketsList = Array.isArray(tickets) ? tickets : [];

      const ordersByStatus: Record<string, number> = {};
      ordersList.forEach((o: any) => { ordersByStatus[o.status] = (ordersByStatus[o.status] || 0) + 1; });

      const ticketsByStatus: Record<string, number> = {};
      ticketsList.forEach((t: any) => { ticketsByStatus[t.status] = (ticketsByStatus[t.status] || 0) + 1; });

      const dailyOrders = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(); d.setDate(d.getDate() - i);
        const ds = d.toLocaleDateString('fr-FR', { weekday: 'short' });
        dailyOrders.push({ date: ds, count: ordersList.filter((o: any) => new Date(o.created_at).toDateString() === d.toDateString()).length });
      }

      setStats({
        total_revenue: ordersList.reduce((s: number, o: any) => s + (o.total || 0), 0),
        total_orders: ordersList.length,
        total_clients: 5,
        total_products: products?.pagination?.total || products?.data?.length || 0,
        total_tickets: ticketsList.length,
        revenue_30d: ordersList.reduce((s: number, o: any) => s + (o.total || 0), 0),
        orders_by_status: ordersByStatus,
        tickets_by_status: ticketsByStatus,
        daily_orders: dailyOrders,
      });
    } catch (e) { console.error(e); }
  };

  if (!stats) return <div className="text-center py-10 text-gray-400">Chargement du tableau de bord...</div>;

  const orderStatusLabels: Record<string, string> = { pending: 'En attente', confirmed: 'Confirmée', paid: 'Payée', shipped: 'Expédiée', delivered: 'Livrée', cancelled: 'Annulée' };
  const chartOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tableau de Bord AM Info</h1>
          <p className="text-sm text-gray-500">Vue d’ensemble des ventes et de l’activité en Ariary (MGA)</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <p className="text-gray-400 text-xs font-semibold uppercase">Chiffre d’affaires (Ar)</p>
          <p className="text-xl font-black text-blue-600 mt-1">{formatAriary(stats.total_revenue)}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <p className="text-gray-400 text-xs font-semibold uppercase">Commandes</p>
          <p className="text-2xl font-black text-emerald-600 mt-1">{stats.total_orders}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <p className="text-gray-400 text-xs font-semibold uppercase">Clients Enregistrés</p>
          <p className="text-2xl font-black text-purple-600 mt-1">{stats.total_clients}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <p className="text-gray-400 text-xs font-semibold uppercase">Tickets SAV & Support</p>
          <p className="text-2xl font-black text-amber-600 mt-1">{stats.total_tickets}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-bold text-sm text-gray-900 mb-4">Commandes récentes (7 jours)</h3>
          <div className="h-56">
            <Line data={{ labels: stats.daily_orders.map((d: any) => d.date), datasets: [{ data: stats.daily_orders.map((d: any) => d.count), borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,0.08)', fill: true, tension: 0.4 }] }} options={chartOptions} />
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-bold text-sm text-gray-900 mb-4">Répartition par statut</h3>
          <div className="h-56">
            <Bar data={{ labels: Object.keys(stats.orders_by_status).map((s: string) => orderStatusLabels[s] || s), datasets: [{ data: Object.values(stats.orders_by_status), backgroundColor: ['#facc15','#3b82f6','#22c55e','#a855f7','#16a34a','#ef4444'] }] }} options={chartOptions} />
          </div>
        </div>
      </div>
    </div>
  );
}

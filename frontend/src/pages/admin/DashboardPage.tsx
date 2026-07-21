'use client';

// -*- coding: utf-8 -*-
'use client';

import { useState, useEffect } from 'react';
import api from '@/src/api/axios';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, PointElement, LineElement,
  ArcElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';

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
        total_products: products?.pagination?.total || 0,
        total_tickets: ticketsList.length,
        revenue_30d: ordersList.reduce((s: number, o: any) => s + (o.total || 0), 0),
        orders_by_status: ordersByStatus,
        tickets_by_status: ticketsByStatus,
        daily_orders: dailyOrders,
        low_stock: 0,
        out_of_stock: 0,
        top_categories: [{ name: 'Informatique', count: 4 }, { name: 'Telephonie', count: 3 }, { name: 'Audio', count: 2 }, { name: 'Gaming', count: 1 }],
      });
    } catch (e) { console.error(e); }
  };

  if (!stats) return <div className="text-center py-10 text-gray-400">Chargement...</div>;

  const orderStatusLabels: Record<string, string> = { pending: 'En attente', confirmed: 'Confirmee', paid: 'Payee', shipped: 'Expediee', delivered: 'Livree', cancelled: 'Annulee' };
  const chartOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } };

  return (
    <div className="space-y-4 md:space-y-6">
      <h1 className="text-xl md:text-2xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-white rounded-xl shadow-sm border p-4"><p className="text-gray-400 text-xs">Chiffre d&apos;affaires</p><p className="text-xl font-bold text-blue-600">{stats.total_revenue.toFixed(2)} EUR</p></div>
        <div className="bg-white rounded-xl shadow-sm border p-4"><p className="text-gray-400 text-xs">Commandes</p><p className="text-xl font-bold text-green-600">{stats.total_orders}</p></div>
        <div className="bg-white rounded-xl shadow-sm border p-4"><p className="text-gray-400 text-xs">Clients</p><p className="text-xl font-bold text-purple-600">{stats.total_clients}</p></div>
        <div className="bg-white rounded-xl shadow-sm border p-4"><p className="text-gray-400 text-xs">Tickets</p><p className="text-xl font-bold text-orange-600">{stats.total_tickets}</p></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <h3 className="font-semibold text-sm mb-3">Commandes (7 jours)</h3>
          <div className="h-48"><Line data={{ labels: stats.daily_orders.map((d: any) => d.date), datasets: [{ data: stats.daily_orders.map((d: any) => d.count), borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,0.08)', fill: true, tension: 0.4 }] }} options={chartOptions} /></div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <h3 className="font-semibold text-sm mb-3">Commandes par statut</h3>
          <div className="h-48"><Bar data={{ labels: Object.keys(stats.orders_by_status).map((s: string) => orderStatusLabels[s] || s), datasets: [{ data: Object.values(stats.orders_by_status), backgroundColor: ['#facc15','#3b82f6','#22c55e','#a855f7','#16a34a','#ef4444'] }] }} options={chartOptions} /></div>
        </div>
      </div>
    </div>
  );
}

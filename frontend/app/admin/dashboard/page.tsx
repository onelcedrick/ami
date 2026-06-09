'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/api/client';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, PointElement, LineElement,
  ArcElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Title, Tooltip, Legend, Filler);

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      router.push('/admin/login');
      return;
    }
    loadStats();
    const interval = setInterval(loadStats, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const loadStats = async () => {
    try {
      // Récupérer les stats depuis nos services
      const products = await apiClient.getProducts({ limit: '100' });
      const orders = await apiClient.getOrders();
      const tickets = await apiClient.getTickets();

      // Calculer les statistiques
      const totalProducts = products?.pagination?.total || 0;
      const totalOrders = Array.isArray(orders) ? orders.length : 0;
      const totalTickets = Array.isArray(tickets) ? tickets.length : 0;

      // Chiffre d'affaires (somme des commandes)
      const totalRevenue = Array.isArray(orders) 
        ? orders.reduce((sum: number, o: any) => sum + (o.total || 0), 0) 
        : 0;

      // Commandes par statut
      const ordersByStatus: Record<string, number> = {};
      if (Array.isArray(orders)) {
        orders.forEach((o: any) => {
          ordersByStatus[o.status] = (ordersByStatus[o.status] || 0) + 1;
        });
      }

      // Tickets par statut
      const ticketsByStatus: Record<string, number> = {};
      if (Array.isArray(tickets)) {
        tickets.forEach((t: any) => {
          ticketsByStatus[t.status] = (ticketsByStatus[t.status] || 0) + 1;
        });
      }

      // Commandes par jour (7 derniers jours simulés)
      const dailyOrders = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toLocaleDateString('fr-FR', { weekday: 'short' });
        const count = Array.isArray(orders) 
          ? orders.filter((o: any) => {
              const orderDate = new Date(o.created_at);
              return orderDate.toDateString() === date.toDateString();
            }).length 
          : 0;
        dailyOrders.push({ date: dateStr, count });
      }

      setStats({
        total_revenue: totalRevenue,
        total_orders: totalOrders,
        total_clients: 5, // Simulé
        total_products: totalProducts,
        total_tickets: totalTickets,
        revenue_30d: totalRevenue,
        orders_by_status: ordersByStatus,
        tickets_by_status: ticketsByStatus,
        daily_orders: dailyOrders,
        low_stock: 0,
        out_of_stock: 0,
        top_categories: [
          { name: 'Informatique', count: 4 },
          { name: 'Téléphonie', count: 3 },
          { name: 'Audio', count: 2 },
          { name: 'Gaming', count: 1 },
        ],
      });
    } catch (err) {
      console.error('Erreur chargement stats:', err);
    }
  };

  if (!stats) return (
    <div className="text-center py-20">
      <div className="animate-spin text-4xl mb-4">⚙️</div>
      <p className="text-gray-400">Chargement du dashboard...</p>
    </div>
  );

  const orderStatusLabels: Record<string, string> = {
    pending: 'En attente', confirmed: 'Confirmée', paid: 'Payée',
    shipped: 'Expédiée', delivered: 'Livrée', cancelled: 'Annulée'
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
  };

  const orderChartData = {
    labels: Object.keys(stats.orders_by_status).map(s => orderStatusLabels[s] || s),
    datasets: [{
      data: Object.values(stats.orders_by_status) as number[],
      backgroundColor: ['#facc15', '#3b82f6', '#22c55e', '#a855f7', '#16a34a', '#ef4444'],
      borderRadius: 6,
    }]
  };

  const dailyChartData = {
    labels: stats.daily_orders.map((d: any) => d.date),
    datasets: [{
      data: stats.daily_orders.map((d: any) => d.count),
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59,130,246,0.08)',
      fill: true,
      tension: 0.4,
      pointRadius: 0,
      borderWidth: 2,
    }]
  };

  const categoryChartData = {
    labels: stats.top_categories.map((c: any) => c.name),
    datasets: [{
      data: stats.top_categories.map((c: any) => c.count),
      backgroundColor: ['#3b82f6', '#22c55e', '#f59e0b', '#a855f7', '#ef4444'],
      borderWidth: 0,
    }]
  };

  const ticketChartData = {
    labels: ['Ouverts', 'En cours', 'Résolus', 'Fermés'],
    datasets: [{
      data: [
        stats.tickets_by_status.open || 0,
        stats.tickets_by_status.in_progress || 0,
        stats.tickets_by_status.resolved || 0,
        stats.tickets_by_status.closed || 0,
      ],
      backgroundColor: ['#f59e0b', '#3b82f6', '#22c55e', '#6b7280'],
      borderWidth: 0,
    }]
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <h1 className="text-xl md:text-2xl font-bold">📊 Dashboard</h1>
      
      {/* Cartes stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-gray-400 text-xs mb-1">💰 Chiffre d'affaires</p>
          <p className="text-xl md:text-2xl font-bold text-blue-600">{stats.total_revenue.toFixed(2)} €</p>
          <p className="text-[10px] text-gray-400 mt-1">Total des commandes</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-gray-400 text-xs mb-1">📋 Commandes</p>
          <p className="text-xl md:text-2xl font-bold text-green-600">{stats.total_orders}</p>
          <p className="text-[10px] text-gray-400 mt-1">{stats.orders_by_status.delivered || 0} livrées</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-gray-400 text-xs mb-1">👥 Clients / Produits</p>
          <p className="text-xl md:text-2xl font-bold text-purple-600">{stats.total_clients}</p>
          <p className="text-[10px] text-gray-400 mt-1">{stats.total_products} produits</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-gray-400 text-xs mb-1">🎫 Tickets</p>
          <p className="text-xl md:text-2xl font-bold text-orange-600">{stats.total_tickets}</p>
          <p className="text-[10px] text-gray-400 mt-1">{stats.tickets_by_status.open || 0} ouverts</p>
        </div>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h3 className="font-semibold text-sm mb-3">📈 Commandes (7 jours)</h3>
          <div className="h-48 md:h-56">
            <Line data={dailyChartData} options={chartOptions} />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h3 className="font-semibold text-sm mb-3">📊 Commandes par statut</h3>
          <div className="h-48 md:h-56">
            <Bar data={orderChartData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Donuts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h3 className="font-semibold text-sm mb-3">🍩 Top catégories</h3>
          <div className="h-48 md:h-56 flex items-center justify-center">
            <div className="w-40 md:w-48">
              <Doughnut 
                data={categoryChartData} 
                options={{ 
                  responsive: true, maintainAspectRatio: true,
                  plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, padding: 10, font: { size: 10 } } } } 
                }} 
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h3 className="font-semibold text-sm mb-3">🎫 Tickets par statut</h3>
          <div className="h-48 md:h-56 flex items-center justify-center">
            <div className="w-40 md:w-48">
              <Doughnut 
                data={ticketChartData} 
                options={{ 
                  responsive: true, maintainAspectRatio: true,
                  plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, padding: 10, font: { size: 10 } } } } 
                }} 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

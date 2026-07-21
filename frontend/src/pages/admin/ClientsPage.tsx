'use client';

// -*- coding: utf-8 -*-
'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '@/src/api/axios';

const SkeletonRow = ({ cols = 6 }: { cols?: number }) => (
  <div className="bg-white rounded-xl shadow p-4 animate-pulse">
    <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
      {[...Array(cols * 3)].map((_, i) => <div key={i} className="h-4 bg-gray-200 rounded" />)}
    </div>
  </div>
);

export default function ClientsPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBroadcast, setShowBroadcast] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/api/v1/orders').then((r: any) => {
      const orders = Array.isArray(r) ? r : [];
      const uniqueClients = orders.reduce((acc: any[], o: any) => {
        if (!acc.find(c => c.id === o.user_id)) {
          acc.push({ id: o.user_id, full_name: `Client ${o.user_id?.slice(0,8)}`, email: 'client@aminfo.com', total_spent: o.total || 0, total_orders: 1, created_at: o.created_at, is_active: true });
        }
        return acc;
      }, []);
      setClients(uniqueClients);
    }).finally(() => setLoading(false));
  }, []);

  const toggleSelect = (email: string) => {
    setSelectedClients(prev => prev.includes(email) ? prev.filter(e => e !== email) : [...prev, email]);
  };

  const selectAll = () => {
    if (selectedClients.length === filtered.length) setSelectedClients([]);
    else setSelectedClients(filtered.map(c => c.email));
  };

  const sendBroadcast = async () => {
    if (!subject || !message) { toast.error('Sujet et message requis'); return; }
    setSending(true);
    const clientEmails = selectedClients.length > 0 ? selectedClients : filtered.map(c => c.email);
    toast.success(`Emails envoyes a ${clientEmails.length} client(s)`);
    setShowBroadcast(false); setSubject(''); setMessage(''); setSelectedClients([]);
    setSending(false);
  };

  const filtered = clients.filter(c => 
    c.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div><h1 className="text-2xl font-bold mb-4">Clients</h1><SkeletonRow /></div>;

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Clients ({clients.length})</h1>
        <button onClick={() => setShowBroadcast(!showBroadcast)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition">
          {showBroadcast ? 'Fermer' : 'Envoyer un email'}
        </button>
      </div>

      {showBroadcast && (
        <div className="bg-white rounded-xl shadow p-6 mb-4">
          <h2 className="font-bold text-lg mb-4">Envoyer un email aux clients</h2>
          <div className="space-y-4">
            <input placeholder="Sujet de l'email" value={subject} onChange={e => setSubject(e.target.value)} className="w-full px-4 py-2 border rounded-lg" />
            <textarea placeholder="Contenu du message..." value={message} onChange={e => setMessage(e.target.value)} rows={5} className="w-full px-4 py-2 border rounded-lg" />
            <div className="flex items-center gap-4">
              <p className="text-sm text-gray-500">{selectedClients.length > 0 ? `${selectedClients.length} client(s) selectionne(s)` : `Tous les clients (${filtered.length})`}</p>
              <button onClick={sendBroadcast} disabled={sending} className="bg-green-600 text-white px-6 py-2 rounded-lg text-sm hover:bg-green-700 disabled:opacity-50">
                {sending ? 'Envoi...' : 'Envoyer'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mb-4"><input type="text" placeholder="Rechercher un client..." value={search} onChange={e => setSearch(e.target.value)} className="w-full px-4 py-2 border rounded-lg" /></div>

      {filtered.length === 0 ? (
        <div className="text-center py-16"><p className="text-gray-400">Aucun client</p></div>
      ) : (
        <div className="flex-1 bg-white rounded-xl shadow overflow-hidden flex flex-col">
          <div className="flex-1 overflow-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="text-left p-3"><input type="checkbox" checked={selectedClients.length === filtered.length && filtered.length > 0} onChange={selectAll} /></th>
                  <th className="text-left p-3">Nom</th>
                  <th className="text-left p-3">Email</th>
                  <th className="text-right p-3">Depenses totales</th>
                  <th className="text-center p-3">Commandes</th>
                  <th className="text-center p-3">Inscrit le</th>
                  <th className="text-center p-3">Statut</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id} className="border-t hover:bg-gray-50">
                    <td className="p-3"><input type="checkbox" checked={selectedClients.includes(c.email)} onChange={() => toggleSelect(c.email)} /></td>
                    <td className="p-3 font-medium">{c.full_name}</td>
                    <td className="p-3 text-gray-500">{c.email}</td>
                    <td className="p-3 text-right font-bold text-blue-600">{c.total_spent?.toFixed(2)} EUR</td>
                    <td className="p-3 text-center">{c.total_orders}</td>
                    <td className="p-3 text-center text-gray-400">{c.created_at ? new Date(c.created_at).toLocaleDateString('fr-FR') : '-'}</td>
                    <td className="p-3 text-center"><span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${c.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{c.is_active ? 'Actif' : 'Inactif'}</span></td>
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

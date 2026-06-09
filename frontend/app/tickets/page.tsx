'use client';

import { useEffect, useState } from 'react';
import { getTickets, createTicket } from '@/lib/api';
import { getToken } from '@/lib/api';
import Link from 'next/link';

export default function TicketsPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ subject: '', description: '', priority: 'medium' });
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!getToken()) { window.location.href = '/login'; return; }
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      const data = await getTickets();
      setTickets(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    try {
      await createTicket(form);
      setShowNew(false);
      setForm({ subject: '', description: '', priority: 'medium' });
      setMessage('✅ Ticket créé avec succès !');
      loadTickets();
    } catch (err: any) {
      setMessage('❌ ' + err.message);
    }
  };

  const getPriorityColor = (p: string) => {
    const colors: Record<string, string> = {
      urgent: 'bg-red-100 text-red-800',
      high: 'bg-orange-100 text-orange-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-green-100 text-green-800',
    };
    return colors[p] || 'bg-gray-100';
  };

  const getStatusColor = (s: string) => {
    const colors: Record<string, string> = {
      open: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-purple-100 text-purple-800',
      resolved: 'bg-green-100 text-green-800',
      closed: 'bg-gray-200 text-gray-700',
    };
    return colors[s] || 'bg-gray-100';
  };

  if (loading) return <div className="container mx-auto px-4 py-20 text-center">Chargement...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">🎫 Support SAV</h1>
        <button onClick={() => setShowNew(!showNew)} className="btn btn-primary">
          {showNew ? 'Annuler' : 'Nouveau ticket'}
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-lg mb-4 ${message.startsWith('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-700'}`}>
          {message}
        </div>
      )}

      {showNew && (
        <div className="card mb-8">
          <h2 className="text-xl font-semibold mb-4">Créer un ticket</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <input
              className="input"
              placeholder="Sujet du problème"
              value={form.subject}
              onChange={(e) => setForm({...form, subject: e.target.value})}
              required
            />
            <textarea
              className="input"
              rows={4}
              placeholder="Décrivez votre problème en détail..."
              value={form.description}
              onChange={(e) => setForm({...form, description: e.target.value})}
              required
            />
            <select
              className="input"
              value={form.priority}
              onChange={(e) => setForm({...form, priority: e.target.value})}
            >
              <option value="low">Basse priorité</option>
              <option value="medium">Priorité moyenne</option>
              <option value="high">Haute priorité</option>
              <option value="urgent">Urgent</option>
            </select>
            <button type="submit" className="btn btn-success">Créer le ticket</button>
          </form>
        </div>
      )}

      {tickets.length === 0 && !showNew ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🎫</div>
          <p className="text-gray-500 text-lg">Aucun ticket de support</p>
        </div>
      ) : (
        <div className="space-y-4">
          {tickets.map((ticket: any) => (
            <div key={ticket.id} className="card hover:shadow-md transition">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-lg">{ticket.subject}</h3>
                  <p className="text-sm text-gray-500 line-clamp-2">{ticket.description}</p>
                </div>
                <div className="flex gap-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                    {ticket.priority}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(ticket.status)}`}>
                    {ticket.status}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center text-sm text-gray-500">
                <span>{new Date(ticket.created_at).toLocaleDateString('fr-FR')}</span>
                <span className="text-blue-600">
                  {ticket.messages?.length || 0} message(s)
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

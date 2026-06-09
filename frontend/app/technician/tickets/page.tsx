'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { apiClient } from '@/api/client';
import { useAuth } from '@/contexts/AuthContext';

export default function TicketListPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState('');
  const [showMobileChat, setShowMobileChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'technician') {
      router.push('/technician/login');
      return;
    }
    loadTickets();
  }, [isAuthenticated]);

  useEffect(() => {
    const timer = setTimeout(() => loadTickets(), 300);
    return () => clearTimeout(timer);
  }, [search, filterStatus, filterPriority]);

  useEffect(() => {
    if (selectedTicket) {
      loadMessages();
      const interval = setInterval(loadMessages, 5000);
      return () => clearInterval(interval);
    }
  }, [selectedTicket?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadTickets = async () => {
    try {
      const data = await apiClient.getTickets();
      let ticketsList = Array.isArray(data) ? data : [];
      
      // Filtres locaux
      if (filterStatus !== 'all') {
        ticketsList = ticketsList.filter((t: any) => t.status === filterStatus);
      }
      if (filterPriority !== 'all') {
        ticketsList = ticketsList.filter((t: any) => t.priority === filterPriority);
      }
      if (search) {
        const s = search.toLowerCase();
        ticketsList = ticketsList.filter((t: any) => 
          t.subject?.toLowerCase().includes(s) || t.description?.toLowerCase().includes(s)
        );
      }
      
      setTickets(ticketsList);
    } catch (err) {
      console.error('Erreur chargement tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async () => {
    if (!selectedTicket) return;
    try {
      // Les messages sont déjà inclus dans le ticket
      const msgs = selectedTicket.messages || [];
      setMessages(msgs);
    } catch (err) {
      console.error('Erreur chargement messages:', err);
    }
  };

  const send = async () => {
    if (!text.trim() || !selectedTicket) return;
    try {
      await apiClient.createTicket({
        subject: selectedTicket.subject,
        description: text,
      });
      setText('');
      loadMessages();
      loadTickets();
    } catch (err) {
      toast.error('Erreur envoi message');
    }
  };

  const changeStatus = async (id: string, status: string) => {
    try {
      setTickets(prev => prev.map(t => t.id === id ? { ...t, status } : t));
      toast.success('Statut modifié');
      loadTickets();
    } catch (err) {
      toast.error('Erreur modification statut');
    }
  };

  const selectTicket = (ticket: any) => {
    setSelectedTicket(ticket);
    setShowMobileChat(true);
    // Recharger les messages du ticket
    apiClient.getTickets().then((data: any) => {
      const ticketsList = Array.isArray(data) ? data : [];
      const updated = ticketsList.find((t: any) => t.id === ticket.id);
      if (updated) {
        setSelectedTicket(updated);
        setMessages(updated.messages || []);
      }
    });
  };

  const pLabels: Record<string, string> = { low: 'Faible', medium: 'Normal', high: 'Haute', urgent: 'Urgent' };
  const pIcons: Record<string, string> = { low: '🟢', medium: '🔵', high: '🟠', urgent: '🔴' };
  const sLabels: Record<string, string> = {
    open: 'Ouvert', in_progress: 'En cours', waiting_client: 'Attente',
    resolved: 'Résolu', closed: 'Fermé'
  };
  const sColors: Record<string, string> = {
    open: 'bg-yellow-100 text-yellow-800',
    in_progress: 'bg-purple-100 text-purple-800',
    waiting_client: 'bg-orange-100 text-orange-800',
    resolved: 'bg-green-100 text-green-800',
    closed: 'bg-gray-200 text-gray-700'
  };

  if (loading) {
    return (
      <div>
        <h1 className="text-xl font-bold mb-4">🎫 Tickets</h1>
        <p className="text-gray-400">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-shrink-0 space-y-3 mb-4">
        <h1 className="text-xl md:text-2xl font-bold">🎫 Tickets ({tickets.length})</h1>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 flex gap-2 flex-wrap">
          <input
            type="text"
            placeholder="Rechercher..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 min-w-[140px] px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm">
            <option value="all">Tous statuts</option>
            <option value="open">Ouvert</option>
            <option value="in_progress">En cours</option>
            <option value="waiting_client">Attente client</option>
            <option value="resolved">Résolu</option>
            <option value="closed">Fermé</option>
          </select>
          <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm">
            <option value="all">Toutes priorités</option>
            <option value="low">Faible</option>
            <option value="medium">Normal</option>
            <option value="high">Haute</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {/* Desktop */}
        <div className="hidden md:grid md:grid-cols-2 gap-4 h-full">
          <div className="space-y-2 overflow-y-auto h-full pr-1">
            {tickets.length === 0 ? (
              <div className="text-center text-gray-400 py-8">Aucun ticket trouvé</div>
            ) : (
              tickets.map(t => (
                <div
                  key={t.id}
                  onClick={() => selectTicket(t)}
                  className={`bg-white rounded-xl shadow-sm border p-4 cursor-pointer hover:shadow-md transition ${
                    selectedTicket?.id === t.id ? 'ring-2 ring-teal-500 border-teal-500' : 'border-gray-100'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="text-xs">{pIcons[t.priority] || '⚪'}</span>
                      <h3 className="font-bold text-sm truncate">{t.subject}</h3>
                    </div>
                    <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold ${sColors[t.status] || ''}`}>
                      {sLabels[t.status] || t.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mb-2 line-clamp-2">{t.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-400">{pLabels[t.priority] || t.priority}</span>
                    {t.status === 'open' ? (
                      <button
                        onClick={e => { e.stopPropagation(); changeStatus(t.id, 'in_progress'); }}
                        className="bg-teal-600 text-white px-3 py-1 rounded-full text-xs hover:bg-teal-700"
                      >
                        Prendre en charge
                      </button>
                    ) : (
                      <select
                        value={t.status}
                        onClick={e => e.stopPropagation()}
                        onChange={e => { e.stopPropagation(); changeStatus(t.id, e.target.value); }}
                        className={`px-2 py-0.5 rounded-full text-xs font-semibold cursor-pointer ${sColors[t.status] || ''}`}
                      >
                        <option value="in_progress">En cours</option>
                        <option value="waiting_client">Attente client</option>
                        <option value="resolved">Résolu</option>
                        <option value="closed">Fermé</option>
                      </select>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Chat panel */}
          <div className="h-full">
            {selectedTicket ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-full">
                <div className="p-4 border-b flex-shrink-0">
                  <h2 className="font-bold text-sm">{selectedTicket.subject}</h2>
                  <p className="text-xs text-gray-500 mt-1">#{selectedTicket.id?.slice(0, 8)}</p>
                </div>

                <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50">
                  {messages.length === 0 ? (
                    <p className="text-center text-gray-400 py-8 text-sm">Aucun message.</p>
                  ) : (
                    messages.map((m: any, i: number) => {
                      const isTechnician = m.sender_role === 'technician';
                      return (
                        <div key={i} className={`flex ${isTechnician ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[85%] p-2.5 rounded-2xl ${
                            isTechnician
                              ? 'bg-teal-600 text-white rounded-br-md'
                              : 'bg-white shadow border text-gray-800 rounded-bl-md'
                          }`}>
                            <p className={`text-[10px] font-semibold mb-1 ${isTechnician ? 'text-teal-100' : 'text-gray-500'}`}>
                              {isTechnician ? 'Vous' : 'Client'}
                            </p>
                            <p className="text-sm">{m.message}</p>
                            <p className="text-[10px] mt-1 opacity-60">
                              {new Date(m.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <div className="p-3 border-t flex gap-2 flex-shrink-0 bg-white">
                  <input
                    placeholder="Votre réponse..."
                    value={text}
                    onChange={e => setText(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && send()}
                    className="flex-1 px-3 py-2 border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <button
                    onClick={send}
                    className="bg-teal-600 text-white px-4 py-2 rounded-full hover:bg-teal-700 font-semibold text-sm"
                  >
                    Envoyer
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 h-full flex items-center justify-center text-gray-400">
                <p className="text-sm">👈 Sélectionnez un ticket</p>
              </div>
            )}
          </div>
        </div>

        {/* Mobile */}
        <div className="md:hidden h-full">
          {!showMobileChat ? (
            <div className="space-y-2 overflow-y-auto h-full">
              {tickets.map(t => (
                <div key={t.id} onClick={() => selectTicket(t)}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 cursor-pointer">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-sm truncate flex-1">{t.subject}</h3>
                    <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${sColors[t.status] || ''}`}>
                      {sLabels[t.status] || t.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-1">{t.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-full flex flex-col">
              <div className="flex items-center gap-2 p-3 border-b bg-white">
                <button onClick={() => setShowMobileChat(false)} className="text-teal-600 text-sm font-semibold">
                  ← Retour
                </button>
                <span className="text-sm font-medium truncate">{selectedTicket?.subject}</span>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50">
                {messages.map((m: any, i: number) => {
                  const isTechnician = m.sender_role === 'technician';
                  return (
                    <div key={i} className={`flex ${isTechnician ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] p-2.5 rounded-2xl ${
                        isTechnician ? 'bg-teal-600 text-white' : 'bg-white shadow border'
                      }`}>
                        <p className="text-sm">{m.message}</p>
                        <p className="text-[10px] mt-1 opacity-60">
                          {new Date(m.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="p-2 border-t flex gap-2 bg-white">
                <input
                  placeholder="Réponse..."
                  value={text}
                  onChange={e => setText(e.target.value)}
                  className="flex-1 px-3 py-2 border rounded-full text-sm"
                />
                <button onClick={send} className="bg-teal-600 text-white px-4 py-2 rounded-full font-semibold text-sm">
                  Envoyer
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

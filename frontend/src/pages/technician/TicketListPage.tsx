'use client';

// -*- coding: utf-8 -*-
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import api from '@/src/api/axios';

export default function TicketListPage() {
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
  const router = useRouter();
  const searchParams = useSearchParams();

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const userId = token ? (() => { try { return JSON.parse(atob(token.split('.')[1])).sub; } catch { return null; } })() : null;

  const loadTickets = async () => {
    try {
      const data = await api.get('/api/v1/tickets');
      let list = Array.isArray(data) ? data : [];
      if (search) list = list.filter((t: any) => t.subject?.toLowerCase().includes(search.toLowerCase()));
      if (filterStatus !== 'all') list = list.filter((t: any) => t.status === filterStatus);
      if (filterPriority !== 'all') list = list.filter((t: any) => t.priority === filterPriority);
      setTickets(list);
    } catch {}
    finally { setLoading(false); }
  };

  const loadMessages = () => {
    if (!selectedTicket) return;
    setMessages(selectedTicket.messages || []);
  };

  useEffect(() => { loadTickets(); }, []);
  useEffect(() => { const t = setTimeout(loadTickets, 300); return () => clearTimeout(t); }, [search, filterStatus, filterPriority]);
  useEffect(() => { loadMessages(); }, [selectedTicket?.id]);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);
  useEffect(() => {
    const tid = searchParams?.get('id');
    if (tid && tickets.length > 0) {
      const t = tickets.find(t => t.id === tid);
      if (t) { setSelectedTicket(t); setShowMobileChat(true); }
    }
  }, [searchParams, tickets]);

  const send = async () => {
    if (!text.trim() || !selectedTicket) return;
    await api.post(`/api/v1/tickets/${selectedTicket.id}/messages`, { message: text });
    setText(''); loadTickets();
  };

  const assignToMe = async (id: string) => {
    setTickets(prev => prev.map(t => t.id === id ? { ...t, status: 'in_progress' } : t));
    toast.success('Ticket pris en charge');
  };

  const changeStatus = (id: string, status: string) => {
    setTickets(prev => prev.map(t => t.id === id ? { ...t, status } : t));
    toast.success('Statut modifie');
  };

  const selectTicket = (ticket: any) => { setSelectedTicket(ticket); setShowMobileChat(true); };

  const statusLabels: Record<string, string> = { open: 'Ouvert', in_progress: 'En cours', waiting_client: 'Attente', resolved: 'Resolu', closed: 'Ferme' };
  const statusColors: Record<string, string> = { open: 'bg-yellow-100 text-yellow-800', in_progress: 'bg-purple-100 text-purple-800', waiting_client: 'bg-orange-100 text-orange-800', resolved: 'bg-green-100 text-green-800', closed: 'bg-gray-200 text-gray-700' };
  const priorityLabels: Record<string, string> = { low: 'Faible', medium: 'Normal', high: 'Haute', urgent: 'Urgent' };

  if (loading) return <div><h1 className="text-xl font-bold mb-4">Tickets</h1><p className="text-gray-400">Chargement...</p></div>;

  return (
    <div className="h-full flex flex-col">
      <div className="flex-shrink-0 space-y-3 mb-4">
        <h1 className="text-xl md:text-2xl font-bold">Tickets ({tickets.length})</h1>
        <div className="bg-white rounded-xl shadow-sm border p-3 flex gap-2 flex-wrap">
          <input type="text" placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} className="flex-1 min-w-[140px] px-3 py-2 border rounded-lg text-sm" />
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-3 py-2 border rounded-lg text-sm"><option value="all">Tous</option><option value="open">Ouvert</option><option value="in_progress">En cours</option><option value="resolved">Resolu</option><option value="closed">Ferme</option></select>
          <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)} className="px-3 py-2 border rounded-lg text-sm"><option value="all">Toutes</option><option value="low">Faible</option><option value="medium">Normal</option><option value="high">Haute</option><option value="urgent">Urgent</option></select>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <div className="hidden md:grid md:grid-cols-2 gap-4 h-full">
          <div className="space-y-2 overflow-y-auto h-full">
            {tickets.map(t => (
              <div key={t.id} onClick={() => selectTicket(t)} className={`bg-white rounded-xl shadow-sm border p-4 cursor-pointer hover:shadow-md ${selectedTicket?.id===t.id?'ring-2 ring-teal-500':''}`}>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-sm truncate flex-1">{t.subject}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusColors[t.status]}`}>{statusLabels[t.status]}</span>
                </div>
                <p className="text-xs text-gray-500 mb-2 line-clamp-2">{t.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400">{priorityLabels[t.priority]}</span>
                  {t.status === 'open' ? (
                    <button onClick={e => { e.stopPropagation(); assignToMe(t.id); }} className="bg-teal-600 text-white px-3 py-1 rounded-full text-xs">Prendre</button>
                  ) : (
                    <select value={t.status} onClick={e => e.stopPropagation()} onChange={e => { e.stopPropagation(); changeStatus(t.id, e.target.value); }} className={`px-2 py-0.5 rounded-full text-xs font-semibold cursor-pointer ${statusColors[t.status]}`}>
                      <option value="in_progress">En cours</option><option value="waiting_client">Attente</option><option value="resolved">Resolu</option><option value="closed">Ferme</option>
                    </select>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="h-full">
            {selectedTicket ? (
              <div className="bg-white rounded-xl shadow-sm border flex flex-col h-full">
                <div className="p-4 border-b"><h2 className="font-bold text-sm">{selectedTicket.subject}</h2></div>
                <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50">
                  {messages.map((m: any, i: number) => {
                    const isMine = String(m.sender_id) === String(userId);
                    return (
                      <div key={i} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] p-2.5 rounded-2xl ${isMine ? 'bg-teal-600 text-white' : 'bg-white shadow border text-gray-800'}`}>
                          <p className="text-[10px] font-semibold mb-1 opacity-70">{isMine ? 'Vous' : m.sender_role === 'technician' ? 'Technicien' : 'Client'}</p>
                          <p className="text-sm">{m.message}</p>
                          <p className="text-[10px] mt-1 opacity-60">{new Date(m.created_at).toLocaleTimeString('fr-FR', {hour:'2-digit', minute:'2-digit'})}</p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
                <div className="p-3 border-t flex gap-2 bg-white">
                  <input placeholder="Reponse..." value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key==='Enter'&&send()} className="flex-1 px-3 py-2 border rounded-full text-sm" />
                  <button onClick={send} className="bg-teal-600 text-white px-4 py-2 rounded-full text-sm">Envoyer</button>
                </div>
              </div>
            ) : <div className="bg-white rounded-xl shadow-sm border h-full flex items-center justify-center text-gray-400"><p>Selectionnez un ticket</p></div>}
          </div>
        </div>

        <div className="md:hidden h-full">
          {!showMobileChat ? (
            <div className="space-y-2 overflow-y-auto h-full">
              {tickets.map(t => (
                <div key={t.id} onClick={() => selectTicket(t)} className="bg-white rounded-xl shadow-sm border p-3 cursor-pointer">
                  <div className="flex justify-between"><h3 className="font-bold text-sm truncate">{t.subject}</h3><span className={`px-1.5 py-0.5 rounded-full text-[10px] ${statusColors[t.status]}`}>{statusLabels[t.status]}</span></div>
                  <p className="text-xs text-gray-500 mt-1">{t.description?.slice(0, 80)}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-full flex flex-col">
              <div className="flex items-center gap-2 p-3 border-b bg-white"><button onClick={() => setShowMobileChat(false)} className="text-teal-600 text-sm font-semibold">Retour</button><span className="text-sm truncate">{selectedTicket?.subject}</span></div>
              <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50">
                {messages.map((m: any, i: number) => {
                  const isMine = String(m.sender_id) === String(userId);
                  return (
                    <div key={i} className={`flex ${isMine?'justify-end':'justify-start'}`}>
                      <div className={`max-w-[85%] p-2.5 rounded-2xl ${isMine?'bg-teal-600 text-white':'bg-white shadow border'}`}><p className="text-sm">{m.message}</p></div>
                    </div>
                  );
                })}
              </div>
              <div className="p-2 border-t flex gap-2 bg-white">
                <input placeholder="Reponse..." value={text} onChange={e => setText(e.target.value)} className="flex-1 px-3 py-2 border rounded-full text-sm" />
                <button onClick={send} className="bg-teal-600 text-white px-4 py-2 rounded-full text-sm">Envoyer</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

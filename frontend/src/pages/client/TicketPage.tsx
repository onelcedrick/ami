'use client';

// -*- coding: utf-8 -*-
'use client';

import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import api from '@/src/api/axios';
import Rating from '@/src/components/Rating';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8085/ws';

export default function TicketPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [ticketId, setTicketId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState('');
  const [subject, setSubject] = useState('');
  const [desc, setDesc] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [typing, setTyping] = useState(false);
  const [showMobileChat, setShowMobileChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}') : {};
  const userId = token ? (() => { try { return JSON.parse(atob(token.split('.')[1])).sub; } catch { return null; } })() : null;

  const ticket = tickets.find(t => t.id === ticketId);

  const loadTickets = () => api.get('/api/v1/tickets').then((r: any) => setTickets(Array.isArray(r) ? r : []));
  const loadMessages = () => {
    if (!ticketId) return;
    api.get(`/api/v1/tickets/${ticketId}`).then((r: any) => setMessages(r.messages || []));
  };

  useEffect(() => { loadTickets(); }, []);
  useEffect(() => { loadMessages(); }, [ticketId]);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);
  useEffect(() => { if (!ticketId) return; const i = setInterval(loadMessages, 3000); return () => clearInterval(i); }, [ticketId]);

  const send = async () => {
    if (!text.trim() || !ticketId) return;
    await api.post(`/api/v1/tickets/${ticketId}/messages`, { message: text });
    setText(''); loadMessages();
  };

  const createTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post('/api/v1/tickets', { subject, description: desc, priority: 'medium' });
    setSubject(''); setDesc(''); setShowForm(false); loadTickets();
    toast.success('Ticket cree');
  };

  const getMessageStyle = (m: any) => {
    if (String(m.sender_id) === String(userId)) return { align: 'justify-end', bg: 'bg-blue-600 text-white', label: '' };
    return { align: 'justify-start', bg: 'bg-white shadow border text-gray-800', label: m.sender_role === 'technician' ? 'Technicien' : 'Client' };
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-shrink-0 flex justify-between items-center mb-4">
        <h1 className="text-xl md:text-2xl font-bold">Maintenance</h1>
        <button onClick={() => setShowForm(!showForm)} className="bg-blue-600 text-white px-3 py-2 rounded-lg text-xs md:text-sm hover:bg-blue-700 transition">
          {showForm ? 'Annuler' : '+ Ticket'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={createTicket} className="bg-white rounded-xl shadow-sm border p-4 mb-4">
          <input placeholder="Sujet du probleme" value={subject} onChange={e => setSubject(e.target.value)} required className="w-full px-4 py-2 border rounded-lg mb-2 text-sm" />
          <textarea placeholder="Decrivez votre probleme..." value={desc} onChange={e => setDesc(e.target.value)} required rows={3} className="w-full px-4 py-2 border rounded-lg mb-2 text-sm" />
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">Creer le ticket</button>
        </form>
      )}

      <div className="flex-1 overflow-hidden">
        <div className="hidden md:grid md:grid-cols-3 gap-4 h-full">
          <div className="space-y-2 overflow-y-auto h-full">
            {tickets.map(t => (
              <div key={t.id} onClick={() => { setTicketId(t.id); }}
                className={`bg-white rounded-xl shadow-sm border p-3 cursor-pointer hover:shadow-md transition ${ticketId === t.id ? 'ring-2 ring-blue-500' : 'border-gray-100'}`}>
                <h3 className="font-bold text-sm truncate">{t.subject}</h3>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">{t.status}</span>
              </div>
            ))}
          </div>
          <div className="col-span-2 h-full">
            {ticket ? (
              <div className="bg-white rounded-xl shadow-sm border flex flex-col h-full">
                <div className="p-4 border-b"><h2 className="font-bold text-sm">{ticket.subject}</h2></div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                  {messages.length === 0 && <p className="text-center text-gray-400 text-sm">Aucun message</p>}
                  {messages.map((m: any, i: number) => {
                    const style = getMessageStyle(m);
                    return (
                      <div key={i} className={`flex ${style.align}`}>
                        <div className={`max-w-[75%] p-3 rounded-2xl ${style.bg}`}>
                          {style.label && <p className="text-xs font-semibold mb-1 text-gray-500">{style.label}</p>}
                          <p className="text-sm">{m.message}</p>
                          <p className="text-xs mt-1 opacity-60">{new Date(m.created_at).toLocaleTimeString('fr-FR', {hour:'2-digit', minute:'2-digit'})}</p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
                {(ticket.status === 'resolved' || ticket.status === 'closed') && <Rating ticketId={ticket.id} ticketStatus={ticket.status} />}
                <div className="p-3 border-t flex gap-2 bg-white">
                  <input placeholder="Message..." value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()}
                    className="flex-1 px-3 py-2 border rounded-full text-sm" />
                  <button onClick={send} className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm">Envoyer</button>
                </div>
              </div>
            ) : <div className="bg-white rounded-xl shadow-sm border h-full flex items-center justify-center text-gray-400"><p>Selectionnez un ticket</p></div>}
          </div>
        </div>

        {/* Mobile */}
        <div className="md:hidden h-full">
          {!showMobileChat ? (
            <div className="space-y-2 overflow-y-auto h-full">
              {tickets.map(t => (
                <div key={t.id} onClick={() => { setTicketId(t.id); setShowMobileChat(true); }}
                  className="bg-white rounded-xl shadow-sm border p-3 cursor-pointer">
                  <h3 className="font-bold text-sm truncate">{t.subject}</h3>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">{t.status}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-full flex flex-col">
              <div className="flex items-center gap-2 p-3 border-b bg-white">
                <button onClick={() => setShowMobileChat(false)} className="text-blue-600 text-sm font-semibold">Retour</button>
                <span className="text-sm font-medium truncate">{ticket?.subject}</span>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50">
                {messages.map((m: any, i: number) => {
                  const style = getMessageStyle(m);
                  return (
                    <div key={i} className={`flex ${style.align}`}>
                      <div className={`max-w-[85%] p-2.5 rounded-2xl ${style.bg}`}>
                        {style.label && <p className="text-xs font-semibold mb-1">{style.label}</p>}
                        <p className="text-sm">{m.message}</p>
                        <p className="text-xs mt-1 opacity-60">{new Date(m.created_at).toLocaleTimeString('fr-FR', {hour:'2-digit', minute:'2-digit'})}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="p-2 border-t flex gap-1 bg-white">
                <input placeholder="Message..." value={text} onChange={e => setText(e.target.value)}
                  className="flex-1 px-3 py-2 border rounded-full text-xs" />
                <button onClick={send} className="bg-blue-600 text-white px-3 py-2 rounded-full text-xs">Envoyer</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

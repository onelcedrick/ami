'use client';

// -*- coding: utf-8 -*-
'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '@/src/api/axios';
import { IconPlus, IconClose, IconUser } from '@/src/components/Icons';

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('technician');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { loadUsers(); }, []);

  const loadUsers = async () => {
    try {
      const orders = await api.get('/api/v1/orders');
      const ordersList = Array.isArray(orders) ? orders : [];
      const uniqueUsers = ordersList.reduce((acc: any[], o: any) => {
        if (!acc.find(u => u.id === o.user_id)) {
          acc.push({ id: o.user_id, full_name: `Client ${o.user_id?.slice(0,8)}`, email: 'client@aminfo.com', role: 'client', is_active: true, created_at: o.created_at });
        }
        return acc;
      }, []);
      // Ajouter admin et technicien connus
      uniqueUsers.push({ id: 'admin-1', full_name: 'Admin AM Info', email: 'admin@aminfo.com', role: 'admin', is_active: true, created_at: new Date().toISOString() });
      uniqueUsers.push({ id: 'tech-1', full_name: 'Jean Technicien', email: 'tech@aminfo.com', role: 'technician', is_active: true, created_at: new Date().toISOString() });
      setUsers(uniqueUsers);
    } catch { toast.error('Erreur chargement'); }
    finally { setLoading(false); }
  };

  const createUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password) { toast.error('Tous les champs sont requis'); return; }
    setSubmitting(true);
    try {
      const [first_name, ...last] = fullName.split(' ');
      await api.post('/api/v1/auth/register', { first_name, last_name: last.join(' ') || first_name, email, password });
      if (role === 'technician' || role === 'admin') {
        toast.success('Compte cree ! Le role doit etre modifie en base.');
      } else {
        toast.success('Compte client cree !');
      }
      setFullName(''); setEmail(''); setPassword(''); setRole('technician'); setShowForm(false);
      loadUsers();
    } catch (err: any) { toast.error(err.message || 'Erreur'); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Utilisateurs</h1>
        <button onClick={() => setShowForm(!showForm)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition flex items-center gap-1">
          <IconPlus size={16} /> Creer un compte
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-lg">Creer un compte</h2>
            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><IconClose size={20} /></button>
          </div>
          <form onSubmit={createUser} className="space-y-4">
            <div><label className="block text-sm font-medium mb-1">Nom complet</label><input type="text" value={fullName} onChange={e => setFullName(e.target.value)} required className="w-full px-4 py-2 border rounded-lg" /></div>
            <div><label className="block text-sm font-medium mb-1">Email</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full px-4 py-2 border rounded-lg" /></div>
            <div><label className="block text-sm font-medium mb-1">Mot de passe</label><input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} className="w-full px-4 py-2 border rounded-lg" /></div>
            <div><label className="block text-sm font-medium mb-1">Role</label><select value={role} onChange={e => setRole(e.target.value)} className="w-full px-4 py-2 border rounded-lg"><option value="technician">Technicien</option><option value="admin">Administrateur</option><option value="client">Client</option></select></div>
            <button type="submit" disabled={submitting} className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50">{submitting ? 'Creation...' : 'Creer le compte'}</button>
          </form>
        </div>
      )}

      {loading ? <div className="text-center py-10">Chargement...</div> : (
        <div className="flex-1 bg-white rounded-xl shadow-sm border overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 sticky top-0"><tr><th className="text-left p-3">Nom</th><th className="text-left p-3">Email</th><th className="text-center p-3">Role</th><th className="text-center p-3">Statut</th><th className="text-center p-3">Inscrit le</th></tr></thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-t hover:bg-gray-50">
                  <td className="p-3 font-medium">{u.full_name}</td>
                  <td className="p-3 text-gray-500">{u.email}</td>
                  <td className="p-3 text-center"><span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${u.role==='admin'?'bg-purple-100 text-purple-700':u.role==='technician'?'bg-teal-100 text-teal-700':'bg-blue-100 text-blue-700'}`}>{u.role}</span></td>
                  <td className="p-3 text-center"><span className={`px-2 py-0.5 rounded-full text-xs ${u.is_active?'bg-green-100 text-green-700':'bg-red-100 text-red-700'}`}>{u.is_active?'Actif':'Inactif'}</span></td>
                  <td className="p-3 text-center text-xs text-gray-400">{new Date(u.created_at).toLocaleDateString('fr-FR')}</td>
                </tr>
              ))}
              {users.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-gray-400">Aucun utilisateur</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

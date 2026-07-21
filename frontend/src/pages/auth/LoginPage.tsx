// -*- coding: utf-8 -*-
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/src/hooks/useAuth';
import api from '@/src/api/axios';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/api/v1/auth/login', { email, password });
      login(res.user, res.access_token);
      if (res.user.role === 'admin') router.push('/admin/dashboard');
      else if (res.user.role === 'technician') router.push('/technician/dashboard');
      else router.push('/');
    } catch (err: any) {
      setError(err.message || 'Email ou mot de passe incorrect');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 px-4">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-blue-600">AM Info</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Assistance & Maintenance Informatique</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4 text-center text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 dark:text-gray-300 text-sm mb-1">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
              placeholder="exemple@email.com"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-gray-700 dark:text-gray-300 text-sm mb-1">Mot de passe</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
              placeholder="Votre mot de passe"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50">
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <p className="text-center mt-6 text-gray-600 dark:text-gray-400 text-sm">
          Pas encore de compte ?{' '}
          <Link href="/register" className="text-blue-600 hover:underline font-semibold">Creer un compte</Link>
        </p>

        <div className="mt-4 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
          <p className="text-center text-gray-500 dark:text-gray-400 text-xs mb-2">Comptes de test</p>
          <div className="text-xs text-gray-400 dark:text-gray-500 space-y-1">
            <p>Admin : admin@aminfo.com / Admin1234!</p>
            <p>Client : client@aminfo.com / Test1234!</p>
            <p>Tech : tech@aminfo.com / Tech1234!</p>
          </div>
        </div>
      </div>
    </div>
  );
}

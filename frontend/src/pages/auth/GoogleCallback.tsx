// -*- coding: utf-8 -*-
'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/src/hooks/useAuth';
import api from '@/src/api/axios';

export default function GoogleCallback() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { login } = useAuth();

  useEffect(() => {
    const token = searchParams?.get('token');
    if (token) {
      localStorage.setItem('token', token);
      
      api.get('/api/v1/auth/me')
        .then((res: any) => {
          login(res.data, token);
          if (res.data.role === 'admin') router.push('/admin/dashboard');
          else if (res.data.role === 'technician') router.push('/technician/dashboard');
          else router.push('/');
        })
        .catch(() => router.push('/login'));
    } else {
      router.push('/login');
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-gray-500">Connexion Google en cours...</p>
      </div>
    </div>
  );
}

'use client';

// -*- coding: utf-8 -*-
import { useState, useEffect } from 'react';
import api from '@/src/api/axios';
import { useAuth } from './useAuth';

export default function useCartCount() {
  const [count, setCount] = useState(0);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) { setCount(0); return; }
    
    api.get('/api/v1/cart/count').then((r: any) => setCount(r.count || 0)).catch(() => {});
    
    const interval = setInterval(() => {
      api.get('/api/v1/cart/count').then((r: any) => setCount(r.count || 0)).catch(() => {});
    }, 5000);
    
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  return count;
}

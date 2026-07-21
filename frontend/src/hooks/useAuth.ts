'use client';

// -*- coding: utf-8 -*-
import { useContext } from 'react';
import { AuthContext } from '@/src/contexts/AuthContext';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit etre utilise dans un AuthProvider');
  }
  return context;
};

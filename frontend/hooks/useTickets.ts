import { useState, useEffect } from 'react';
import { apiClient } from '@/api/client';
import { useAuth } from '@/contexts/AuthContext';

export function useTickets() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) return;
    apiClient.getTickets()
      .then(setTickets)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  return { tickets, loading };
}

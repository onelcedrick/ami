import { useState, useEffect } from 'react';
import { apiClient } from '@/api/client';

export function useProducts(params?: Record<string, string>) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetch = async () => {
    setLoading(true);
    try {
      const data = await apiClient.getProducts(params);
      setProducts(data.data || []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, [JSON.stringify(params)]);

  return { products, loading, error, refetch: fetch };
}

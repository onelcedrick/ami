'use client';

import { useState, useEffect } from 'react';

const STORAGE_KEY = 'am_recently_viewed';

export function useRecentlyViewed() {
  const [recentlyViewed, setRecentlyViewed] = useState<any[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setRecentlyViewed(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
  }, []);

  const addProduct = (product: any) => {
    if (!product || !product.id) return;
    try {
      const current = [...recentlyViewed];
      const filtered = current.filter((p) => p.id !== product.id);
      const updated = [product, ...filtered].slice(0, 8);
      setRecentlyViewed(updated);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  return { recentlyViewed, addProduct };
}

export default useRecentlyViewed;

'use client';

import { useState, useEffect } from 'react';
import { getSettings, SiteSettings } from '@/src/api/settings';

export function useSettings() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSettings()
      .then((data: any) => {
        setSettings(data);
      })
      .catch(() => {})
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return { settings, loading };
}

export default useSettings;

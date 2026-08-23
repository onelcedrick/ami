'use client';

import { Suspense } from 'react';
import SettingsPage from '@/src/pages/admin/SettingsPage';

export default function Page() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-400">Chargement...</div>}>
      <SettingsPage />
    </Suspense>
  );
}

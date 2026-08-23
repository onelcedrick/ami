'use client';

import { Suspense } from 'react';
import MapPage from '@/src/pages/client/MapPage';

export default function Page() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-400">Chargement...</div>}>
      <MapPage />
    </Suspense>
  );
}

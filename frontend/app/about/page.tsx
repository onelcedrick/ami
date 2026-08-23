'use client';

import { Suspense } from 'react';
import AboutPage from '@/src/pages/client/AboutPage';

export default function Page() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-400">Chargement...</div>}>
      <AboutPage />
    </Suspense>
  );
}

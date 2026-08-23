'use client';

import { Suspense } from 'react';
import ComparePage from '@/src/pages/client/ComparePage';

export default function Page() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-400">Chargement...</div>}>
      <ComparePage />
    </Suspense>
  );
}

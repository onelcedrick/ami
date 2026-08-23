'use client';

import { Suspense } from 'react';
import PaymentPage from '@/src/pages/client/PaymentPage';

export default function Page() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-400">Chargement...</div>}>
      <PaymentPage />
    </Suspense>
  );
}

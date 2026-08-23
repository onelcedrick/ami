'use client';

import { Suspense } from 'react';
import GoogleCallback from '@/src/pages/auth/GoogleCallback';

export default function Page() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-400">Connexion Google...</div>}>
      <GoogleCallback />
    </Suspense>
  );
}

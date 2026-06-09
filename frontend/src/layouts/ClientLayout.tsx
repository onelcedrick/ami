'use client';

import Navbar from '@/components/layout/Navbar';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden">
      <Navbar />
      <main className="flex-1 overflow-auto bg-gray-50">
        <div className="max-w-7xl mx-auto px-3 md:px-6 py-4 md:py-6 h-full">
          {children}
        </div>
      </main>
    </div>
  );
}

'use client';

import { usePathname } from 'next/navigation';
import { AuthProvider } from '@/src/contexts/AuthContext';
import { ThemeProvider } from '@/src/contexts/ThemeContext';
import ClientLayout from './ClientLayout';
import AdminLayout from './AdminLayout';
import TechnicianLayout from './TechnicianLayout';
import { Toaster } from 'react-hot-toast';

export default function RootClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin') && pathname !== '/admin/login';
  const isTechnicianRoute = pathname?.startsWith('/technician') && pathname !== '/technician/login';

  return (
    <ThemeProvider>
      <AuthProvider>
        {isAdminRoute ? (
          <AdminLayout>{children}</AdminLayout>
        ) : isTechnicianRoute ? (
          <TechnicianLayout>{children}</TechnicianLayout>
        ) : (
          <ClientLayout>{children}</ClientLayout>
        )}
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      </AuthProvider>
    </ThemeProvider>
  );
}

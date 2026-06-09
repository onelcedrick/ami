'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import ToastProvider from '@/contexts/ToastContext';
import ClientLayout from './ClientLayout';
import AdminLayout from './AdminLayout';
import TechnicianLayout from './TechnicianLayout';

function LayoutSwitcher({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (isLoading || !isAuthenticated || !user) return;

    const role = user.role;

    // Redirection selon le rôle après login
    if (role === 'admin' && !pathname.startsWith('/admin')) {
      router.push('/admin/dashboard');
    } else if (role === 'technician' && !pathname.startsWith('/technician')) {
      router.push('/technician/dashboard');
    }
    // Les clients restent sur les pages normales
  }, [isAuthenticated, user, isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin text-4xl">⚙️</div>
      </div>
    );
  }

  // Admin layout
  if (user?.role === 'admin' && pathname.startsWith('/admin')) {
    return <AdminLayout>{children}</AdminLayout>;
  }

  // Technician layout
  if (user?.role === 'technician' && pathname.startsWith('/technician')) {
    return <TechnicianLayout>{children}</TechnicianLayout>;
  }

  // Client layout (défaut)
  return <ClientLayout>{children}</ClientLayout>;
}

export default function RootLayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <LayoutSwitcher>{children}</LayoutSwitcher>
          <ToastProvider />
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

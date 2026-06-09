'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { IconLogout, IconSun, IconMoon, IconPackage, IconOrders, IconUser } from '@/components/ui/Icons';

const IconDashboard = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
  </svg>
);

const IconDiscount = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
  </svg>
);

const IconTransaction = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
  </svg>
);

const IconInvoice = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const IconLogs = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
  </svg>
);

const IconChevronLeft = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);

const IconMenu = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const IconClose = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const adminLinks = [
  { href: '/admin/dashboard', icon: <IconDashboard size={20} />, label: 'Dashboard' },
  { href: '/admin/products', icon: <IconPackage size={20} />, label: 'Produits' },
  { href: '/admin/discounts', icon: <IconDiscount size={20} />, label: 'Promotions' },
  { href: '/admin/orders', icon: <IconOrders size={20} />, label: 'Commandes' },
  { href: '/admin/transactions', icon: <IconTransaction size={20} />, label: 'Transactions' },
  { href: '/admin/clients', icon: <IconUser size={20} />, label: 'Clients' },
  { href: '/admin/tickets', icon: <IconOrders size={20} />, label: 'Tickets' },
  { href: '/admin/invoices', icon: <IconInvoice size={20} />, label: 'Factures' },
  { href: '/admin/logs', icon: <IconLogs size={20} />, label: 'Logs' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const { dark, toggle } = useTheme();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setMobileOpen(false)} />
      )}

      <aside className={`${collapsed ? 'w-16' : 'w-60'} bg-gray-900 text-white flex flex-col flex-shrink-0 transition-all duration-300 fixed md:relative z-50 h-full ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-4 flex items-center justify-between border-b border-gray-800">
          {!collapsed && <h2 className="text-lg font-bold truncate">Administration</h2>}
          <button onClick={() => setCollapsed(!collapsed)} className="hidden md:block text-gray-400 hover:text-white">
            <IconChevronLeft size={18} className={`transition-transform ${collapsed ? 'rotate-180' : ''}`} />
          </button>
          <button onClick={() => setMobileOpen(false)} className="md:hidden text-gray-400">✕</button>
        </div>

        <nav className="flex flex-col flex-1 px-2 py-2 space-y-0.5 overflow-y-auto">
          {adminLinks.map(item => (
            <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}
              className={`py-2.5 px-3 rounded-lg hover:bg-gray-800 transition text-sm flex items-center gap-3 ${pathname === item.href ? 'bg-gray-800 text-white' : 'text-gray-300'} ${collapsed ? 'justify-center' : ''}`}
              title={collapsed ? item.label : ''}>
              <span className="flex-shrink-0">{item.icon}</span>
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          ))}
        </nav>

        <div className="p-3 border-t border-gray-800">
          <Link href="/" className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'} mb-3 hover:opacity-80`}>
            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0">
              <IconUser size={16} />
            </div>
            {!collapsed && <p className="text-xs text-gray-400 truncate">{user?.first_name} {user?.last_name}</p>}
          </Link>
          <button onClick={logout}
            className="w-full bg-red-600/20 text-red-400 py-2 rounded-lg hover:bg-red-600/30 transition text-xs flex items-center justify-center gap-2">
            <IconLogout size={14} />
            {!collapsed && 'Déconnexion'}
          </button>
          {!collapsed && (
            <button onClick={toggle} className="w-full mt-2 text-gray-400 hover:text-white transition text-xs flex items-center justify-center gap-1">
              {dark ? <IconSun size={14} /> : <IconMoon size={14} />}
              Mode {dark ? 'clair' : 'sombre'}
            </button>
          )}
        </div>
      </aside>

      <main className="flex-1 overflow-auto bg-gray-100 flex flex-col">
        <div className="md:hidden flex items-center justify-between p-4 bg-white border-b">
          <button onClick={() => setMobileOpen(true)} className="text-gray-600"><IconMenu size={24} /></button>
          <h2 className="font-bold text-sm">AM Info Admin</h2>
          <button onClick={toggle} className="text-gray-600">{dark ? <IconSun size={20} /> : <IconMoon size={20} />}</button>
        </div>
        <div className="flex-1 p-4 md:p-6 overflow-auto">{children}</div>
      </main>
    </div>
  );
}

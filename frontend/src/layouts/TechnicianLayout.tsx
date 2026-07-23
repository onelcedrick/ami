'use client';

// -*- coding: utf-8 -*-
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/hooks/useAuth';
import { useTheme } from '@/src/contexts/ThemeContext';
import {
  IconDashboard, IconLogout, IconSun, IconMoon,
  IconUser, IconTicket, IconPhoto, IconClose
} from '@/src/components/Icons';

const IconMenu = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const IconChevronLeft = ({ size = 20, className = '' }: { size?: number; className?: string }) => (
  <svg width={size} height={size} fill="none" stroke="currentColor" viewBox="0 0 24 24" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);

export default function TechnicianLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const { dark, toggle } = useTheme();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setMobileOpen(false)} />
      )}

      <aside className={`
        ${collapsed ? 'w-16' : 'w-60'} bg-teal-800 text-white flex flex-col flex-shrink-0 transition-all duration-300
        fixed md:relative z-50 h-full
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-4 flex items-center justify-between border-b border-teal-700">
          {!collapsed && <h2 className="text-lg font-bold truncate">Technicien</h2>}
          <button onClick={() => setCollapsed(!collapsed)} className="hidden md:block text-teal-300 hover:text-white transition">
            <IconChevronLeft size={18} className={`transition-transform ${collapsed ? 'rotate-180' : ''}`} />
          </button>
          <button onClick={() => setMobileOpen(false)} className="md:hidden text-teal-300">
            <IconClose size={18} />
          </button>
        </div>

        <nav className="flex flex-col flex-1 px-2 py-2 space-y-0.5 overflow-y-auto">
          {[
            { href: '/technician/dashboard', icon: <IconDashboard size={20} />, label: 'Dashboard' },
            { href: '/technician/tickets', icon: <IconTicket size={20} />, label: 'Tickets' },
            { href: '/technician/parts', icon: <IconPhoto size={20} />, label: 'Demandes pieces' },
          ].map(item => (
            <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}
              className={`py-2.5 px-3 rounded-lg hover:bg-teal-700 transition text-sm flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}
              title={collapsed ? item.label : ''}>
              {item.icon}
              {!collapsed && item.label}
            </Link>
          ))}

          <div className="border-t border-teal-700 my-2" />

          <Link href="/technician/profile" onClick={() => setMobileOpen(false)}
            className={`py-2.5 px-3 rounded-lg hover:bg-teal-700 transition text-sm flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}
            title={collapsed ? 'Profil' : ''}>
            <IconUser size={20} />
            {!collapsed && 'Profil'}
          </Link>
        </nav>

        <div className="p-3 border-t border-teal-700">
          <Link href="/technician/profile" className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'} mb-3`}>
            <div className="w-8 h-8 rounded-full bg-teal-700 flex items-center justify-center flex-shrink-0">
              <IconUser size={16} />
            </div>
            {!collapsed && <p className="text-xs text-teal-300 truncate">{user?.first_name} {user?.last_name}</p>}
          </Link>
          <button onClick={() => { logout(); router.push('/login'); }}
            className="w-full bg-red-600/20 text-red-400 py-2 rounded-lg hover:bg-red-600/30 transition text-xs flex items-center justify-center gap-2">
            <IconLogout size={14} />
            {!collapsed && 'Deconnexion'}
          </button>
          {!collapsed && (
            <button onClick={toggle} className="w-full mt-2 text-teal-300 hover:text-white transition text-xs flex items-center justify-center gap-1">
              {dark ? <IconSun size={14} /> : <IconMoon size={14} />}
              Mode {dark ? 'clair' : 'sombre'}
            </button>
          )}
        </div>
      </aside>

      <main className="flex-1 overflow-auto bg-gray-100 flex flex-col">
        <div className="md:hidden flex items-center justify-between p-4 bg-white border-b">
          <button onClick={() => setMobileOpen(true)} className="text-gray-600"><IconMenu size={24} /></button>
          <h2 className="font-bold text-sm">AM Info Tech</h2>
          <div className="flex items-center gap-2">
            <Link href="/technician/profile" className="text-gray-600">
              <IconUser size={20} />
            </Link>
            <button onClick={toggle} className="text-gray-600">{dark ? <IconSun size={20} /> : <IconMoon size={20} />}</button>
          </div>
        </div>
        <div className="flex-1 p-4 md:p-6 overflow-auto">{children}</div>
      </main>
    </div>
  );
}

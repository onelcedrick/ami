// -*- coding: utf-8 -*-
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/hooks/useAuth';
import { useTheme } from '@/src/contexts/ThemeContext';
import useCartCount from '@/src/hooks/useCartCount';
import {
  IconCart, IconUser, IconLogout, IconSun, IconMoon,
  IconPackage, IconOrders, IconTicket, IconMap, IconClose
} from '@/src/components/Icons';

const IconMenu = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const IconHome = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, logout } = useAuth();
  const { dark, toggle } = useTheme();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const cartCount = useCartCount();
  const closeMenu = () => setMenuOpen(false);

  const navLinks = [
    { href: '/', icon: <IconHome size={18} />, label: 'Accueil' },
    { href: '/products', icon: <IconPackage size={18} />, label: 'Produits' },
    { href: '/compare', icon: <IconPackage size={18} />, label: 'Comparateur' },
    { href: '/about', icon: <IconPackage size={18} />, label: 'À Propos' },
    { href: '/map', icon: <IconMap size={18} />, label: 'Boutique' },
  ];

  const authLinks = [
    { href: '/cart', icon: <IconCart size={18} />, label: 'Panier', badge: cartCount },
    { href: '/orders', icon: <IconOrders size={18} />, label: 'Commandes' },
    { href: '/tickets', icon: <IconTicket size={18} />, label: 'SAV & Assistance' },
  ];

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden dark:bg-gray-900">
      {/* Navbar */}
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex-shrink-0 z-30">
        <div className="px-4 md:px-6">
          <div className="flex justify-between items-center h-14">
            <Link href="/" className="text-lg md:text-xl font-bold text-blue-600 flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <IconPackage size={18} className="text-white" />
              </div>
              <span className="dark:text-white">AM Info</span>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              {navLinks.map(l => (
                <Link key={l.href} href={l.href} className="px-3 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-gray-700 transition flex items-center gap-1.5">
                  {l.icon} {l.label}
                </Link>
              ))}
              {isAuthenticated && authLinks.map(l => (
                <Link key={l.href} href={l.href} className="px-3 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-gray-700 transition flex items-center gap-1.5 relative">
                  {l.icon}
                  {(l.badge ?? 0) > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center animate-pulse">
                      {(l.badge ?? 0) > 9 ? '9+' : l.badge}
                    </span>
                  )}
                  {l.label}
                </Link>
              ))}
              <span className="w-px h-6 bg-gray-200 dark:bg-gray-600 mx-2" />
              {isAuthenticated ? (
                <>
                  <Link href="/profile" className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                      <IconUser size={16} />
                    </div>
                    <span className="text-sm text-gray-700 dark:text-gray-200 font-medium">{user?.first_name} {user?.last_name}</span>
                  </Link>
                  <button onClick={() => { logout(); router.push('/'); }} className="p-2 text-gray-400 hover:text-red-500 transition" title="Deconnexion">
                    <IconLogout size={18} />
                  </button>
                </>
              ) : (
                <Link href="/login" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition flex items-center gap-1.5">
                  <IconUser size={16} /> Connexion
                </Link>
              )}
              <button onClick={toggle} className="p-2 text-gray-400 dark:text-gray-300 hover:text-gray-600 dark:hover:text-white transition">
                {dark ? <IconSun size={18} /> : <IconMoon size={18} />}
              </button>
            </div>

            <div className="flex md:hidden items-center gap-1">
              <button onClick={toggle} className="p-2 text-gray-500 dark:text-gray-300">
                {dark ? <IconSun size={18} /> : <IconMoon size={18} />}
              </button>
              <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 text-gray-600 dark:text-gray-300">
                <IconMenu size={22} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {menuOpen && <div className="fixed inset-0 bg-black/40 z-40 md:hidden" onClick={closeMenu} />}

      <div className={`fixed top-0 right-0 h-full w-72 bg-white dark:bg-gray-800 z-50 shadow-2xl transform transition-transform duration-300 md:hidden ${menuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <span className="font-bold text-gray-800 dark:text-white">Menu</span>
          <button onClick={closeMenu} className="p-2 text-gray-400"><IconClose size={22} /></button>
        </div>
        <nav className="p-3 space-y-1">
          {navLinks.map(l => (
            <Link key={l.href} href={l.href} onClick={closeMenu} className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition">
              {l.label}
            </Link>
          ))}
          <hr className="my-2 dark:border-gray-600" />
          {isAuthenticated ? (
            <button onClick={() => { logout(); router.push('/'); closeMenu(); }}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 w-full">
              <IconLogout size={18} /> Deconnexion
            </button>
          ) : (
            <Link href="/login" onClick={closeMenu}
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-600 text-white justify-center font-semibold">
              <IconUser size={18} /> Se connecter
            </Link>
          )}
        </nav>
      </div>

      <main className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-3 md:px-6 py-4 md:py-6 h-full">{children}</div>
      </main>
    </div>
  );
}

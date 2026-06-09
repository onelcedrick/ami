'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import useCartCount from '@/hooks/useCartCount';
import {
  IconCart, IconUser, IconLogout, IconSun, IconMoon,
  IconPackage, IconOrders, IconTicket,
  IconMenu, IconClose, IconHome
} from '@/components/ui/Icons';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { dark, toggle } = useTheme();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const cartCount = useCartCount();
  const closeMenu = () => setMenuOpen(false);
  const isAdmin = user?.role === 'admin';

  const navLinks = [
    { to: '/', icon: <IconHome size={18} />, label: 'Accueil' },
    { to: '/products', icon: <IconPackage size={18} />, label: 'Produits' },
  ];

  const authLinks = [
    { to: '/cart', icon: <IconCart size={18} />, label: 'Panier', badge: cartCount },
    { to: '/orders', icon: <IconOrders size={18} />, label: 'Commandes' },
    { to: '/tickets', icon: <IconTicket size={18} />, label: 'Maintenance' },
  ];

  return (
    <nav className="bg-white border-b border-gray-200 flex-shrink-0 z-30">
      <div className="px-4 md:px-6">
        <div className="flex justify-between items-center h-14">
          {/* Logo */}
          <Link href="/" className="text-lg md:text-xl font-bold tracking-tight text-blue-600 flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
              <IconPackage size={18} />
            </div>
            AM Info
          </Link>

          {/* Desktop */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(l => (
              <Link key={l.to} href={l.to} className="px-3 py-2 rounded-lg text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition flex items-center gap-1.5">
                {l.icon} {l.label}
              </Link>
            ))}
            {isAuthenticated && authLinks.map(l => (
              <Link key={l.to} href={l.to} className="px-3 py-2 rounded-lg text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition flex items-center gap-1.5 relative">
                {l.icon}
                {l.badge > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center animate-pulse">
                    {l.badge > 9 ? '9+' : l.badge}
                  </span>
                )}
                {l.label}
              </Link>
            ))}

            {/* Lien Admin */}
            {isAdmin && (
              <Link href="/admin/dashboard" className="px-3 py-2 rounded-lg text-sm bg-blue-600 text-white hover:bg-blue-700 transition flex items-center gap-1.5">
                🛡️ Admin
              </Link>
            )}

            <span className="w-px h-6 bg-gray-200 mx-2" />
            {isAuthenticated ? (
              <>
                <div className="flex items-center gap-2 px-2 py-1">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                    <IconUser size={16} />
                  </div>
                  <span className="text-sm text-gray-700 font-medium">{user?.first_name}</span>
                </div>
                <button onClick={logout} className="p-2 text-gray-400 hover:text-red-500 transition" title="Déconnexion">
                  <IconLogout size={18} />
                </button>
              </>
            ) : (
              <Link href="/login" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition flex items-center gap-1.5">
                <IconUser size={16} /> Connexion
              </Link>
            )}
            <button onClick={toggle} className="p-2 text-gray-400 hover:text-gray-600 transition">
              {dark ? <IconSun size={18} /> : <IconMoon size={18} />}
            </button>
          </div>

          {/* Mobile */}
          <div className="flex md:hidden items-center gap-1">
            {isAuthenticated && (
              <Link href="/cart" className="p-2 text-gray-600 relative">
                <IconCart size={20} />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold min-w-[17px] h-[17px] rounded-full flex items-center justify-center animate-pulse">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </Link>
            )}
            <button onClick={toggle} className="p-2 text-gray-500">
              {dark ? <IconSun size={18} /> : <IconMoon size={18} />}
            </button>
            <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 text-gray-600">
              <IconMenu size={22} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && <div className="fixed inset-0 bg-black/40 z-40 md:hidden" onClick={closeMenu} />}
      <div className={`fixed top-0 right-0 h-full w-72 bg-white z-50 shadow-2xl transform transition-transform duration-300 md:hidden ${menuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between p-4 border-b">
          <span className="font-bold text-gray-800">Menu</span>
          <button onClick={closeMenu} className="p-2 text-gray-400"><IconClose size={22} /></button>
        </div>
        <nav className="p-3 space-y-1">
          {navLinks.map(l => (
            <Link key={l.to} href={l.to} onClick={closeMenu} className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-100">
              <span className="text-gray-400">{l.icon}</span> {l.label}
            </Link>
          ))}
          {isAuthenticated && authLinks.map(l => (
            <Link key={l.to} href={l.to} onClick={closeMenu} className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-100 relative">
              <span className="text-gray-400">{l.icon}</span>
              {l.badge > 0 && <span className="absolute left-10 top-2 bg-red-500 text-white text-[10px] font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center">{l.badge > 9 ? '9+' : l.badge}</span>}
              {l.label}
            </Link>
          ))}
          {isAdmin && (
            <Link href="/admin/dashboard" onClick={closeMenu} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-600 text-white mt-2">
              🛡️ Administration
            </Link>
          )}
          <hr className="my-2" />
          {isAuthenticated ? (
            <button onClick={logout}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 w-full">
              <IconLogout size={18} /> Déconnexion
            </button>
          ) : (
            <Link href="/login" onClick={closeMenu} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-600 text-white justify-center font-semibold">
              <IconUser size={18} /> Se connecter
            </Link>
          )}
        </nav>
      </div>
    </nav>
  );
}

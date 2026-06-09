'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { getToken, setToken } from '@/lib/api';

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!getToken());
  }, []);

  const handleLogout = () => {
    setToken(null);
    setIsLoggedIn(false);
    window.location.href = '/';
  };

  return (
    <nav className="fixed top-0 w-full bg-gray-900 text-white z-50 shadow-lg">
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        <Link href="/" className="text-xl font-bold tracking-wide">
          🛍️ AM Info
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6">
          <Link href="/products" className="hover:text-blue-300 transition">Produits</Link>
          {isLoggedIn && (
            <>
              <Link href="/cart" className="hover:text-blue-300 transition">🛒 Panier</Link>
              <Link href="/orders" className="hover:text-blue-300 transition">📋 Commandes</Link>
              <Link href="/tickets" className="hover:text-blue-300 transition">🎫 Support</Link>
              <Link href="/chat" className="hover:text-blue-300 transition">🤖 Assistant IA</Link>
            </>
          )}
          {isLoggedIn ? (
            <button onClick={handleLogout} className="btn bg-red-600 hover:bg-red-700 text-sm">
              Déconnexion
            </button>
          ) : (
            <Link href="/login" className="btn bg-blue-600 hover:bg-blue-700 text-sm">
              Connexion
            </Link>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button className="md:hidden text-2xl" onClick={() => setMobileMenu(!mobileMenu)}>
          {mobileMenu ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenu && (
        <div className="md:hidden bg-gray-800 px-4 py-4 space-y-3">
          <Link href="/products" className="block py-2" onClick={() => setMobileMenu(false)}>Produits</Link>
          {isLoggedIn && (
            <>
              <Link href="/cart" className="block py-2" onClick={() => setMobileMenu(false)}>🛒 Panier</Link>
              <Link href="/orders" className="block py-2" onClick={() => setMobileMenu(false)}>📋 Commandes</Link>
              <Link href="/tickets" className="block py-2" onClick={() => setMobileMenu(false)}>🎫 Support</Link>
              <Link href="/chat" className="block py-2" onClick={() => setMobileMenu(false)}>🤖 Assistant IA</Link>
            </>
          )}
          {isLoggedIn ? (
            <button onClick={handleLogout} className="btn bg-red-600 w-full">Déconnexion</button>
          ) : (
            <Link href="/login" className="btn bg-blue-600 block text-center w-full" onClick={() => setMobileMenu(false)}>Connexion</Link>
          )}
        </div>
      )}
    </nav>
  );
}

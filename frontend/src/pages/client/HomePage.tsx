'use client';
// -*- coding: utf-8 -*-
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '@/src/hooks/useAuth';
import toast from 'react-hot-toast';
import api from '@/src/api/axios';
import { IconPackage, IconCart, IconMap, IconStar, IconOrders } from '@/src/components/Icons';

export default function HomePage() {
  const { isAuthenticated } = useAuth();
  const [newArrivals, setNewArrivals] = useState<any[]>([]);
  const [popularProducts, setPopularProducts] = useState<any[]>([]);
  const [stats, setStats] = useState({ products: 0 });

  useEffect(() => {
    api.get('/api/v1/products?page=1&limit=20').then((r: any) => {
      const all = r.data || [];
      setStats({ products: r.pagination?.total || all.length });
      setNewArrivals(all.slice(0, 4));
      setPopularProducts(all.slice(4, 8));
    }).catch(() => {});
  }, []);

  const addToCart = async (productId: string, productName: string) => {
    if (!isAuthenticated) return;
    try {
      await api.post('/api/v1/cart/items', { product_id: productId, quantity: 1 });
      toast.success(`${productName} ajoute au panier`);
    } catch (err: any) { toast.error(err.response?.data?.detail || 'Erreur'); }
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-8 md:space-y-14">
      {/* Hero */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white rounded-2xl md:rounded-3xl p-6 md:p-12 lg:p-16"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="relative z-10">
          <motion.h1 initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2, duration: 0.5 }}
            className="text-3xl md:text-5xl font-bold mb-2 md:mb-4">AM Info</motion.h1>
          <motion.p initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3, duration: 0.5 }}
            className="text-lg md:text-xl text-blue-100 mb-1 md:mb-2">Assistance & Maintenance Informatique</motion.p>
          <motion.p initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4, duration: 0.5 }}
            className="text-sm md:text-base text-blue-200 mb-6 md:mb-8 max-w-xl">Votre expert en materiel informatique et depannage technique.</motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.4 }}
            className="flex gap-3 md:gap-4 flex-wrap">
            <Link href="/products" className="bg-white text-blue-600 px-5 md:px-8 py-2.5 md:py-3 rounded-full text-sm md:text-base font-semibold hover:bg-blue-50 transition shadow-lg">Voir les produits</Link>
            {!isAuthenticated && (
              <Link href="/register" className="border-2 border-white text-white px-5 md:px-8 py-2.5 md:py-3 rounded-full text-sm md:text-base font-semibold hover:bg-white/10 transition">Creer un compte</Link>
            )}
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7, duration: 0.5 }}
            className="flex gap-4 md:gap-8 mt-6 md:mt-10">
            <div><p className="text-2xl md:text-3xl font-bold">{stats.products}+</p><p className="text-blue-200 text-xs md:text-sm">Produits</p></div>
            <div><p className="text-2xl md:text-3xl font-bold">24/7</p><p className="text-blue-200 text-xs md:text-sm">Assistance</p></div>
            <div><p className="text-2xl md:text-3xl font-bold">100%</p><p className="text-blue-200 text-xs md:text-sm">Satisfaction</p></div>
          </motion.div>
        </div>
      </motion.div>

      {/* Nouveaux arrives */}
      {newArrivals.length > 0 && (
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeInUp} transition={{ duration: 0.5 }}>
          <div className="flex justify-between items-center mb-4 md:mb-6">
            <div>
              <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2"><span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />Nouveaux arrives</h2>
              <p className="text-gray-400 text-xs md:text-sm mt-1">Decouvrez nos derniers produits</p>
            </div>
            <Link href="/products" className="text-blue-600 hover:underline font-semibold text-sm">Voir tout</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
            {newArrivals.map((p, i) => (
              <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition overflow-hidden group">
                <div className="relative">
                  <span className="absolute top-2 left-2 bg-green-500 text-white px-2 py-0.5 rounded-full text-[10px] font-bold z-10">NOUVEAU</span>
                  <Link href={`/products/${p.id}`} className="block h-36 md:h-48 bg-gray-50 flex items-center justify-center overflow-hidden">
                    <IconPackage size={40} className="text-gray-300" />
                  </Link>
                </div>
                <div className="p-3 md:p-4">
                  <Link href={`/products/${p.id}`}><h3 className="font-bold text-sm md:text-base truncate hover:text-blue-600">{p.name}</h3></Link>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-blue-600 font-bold text-sm">{p.price?.toFixed(2)} EUR</span>
                  </div>
                  {isAuthenticated && (
                    <button onClick={() => addToCart(p.id, p.name)}
                      className="w-full mt-2 bg-blue-600 text-white py-1.5 rounded-lg text-xs md:text-sm hover:bg-blue-700 transition flex items-center justify-center gap-1">
                      <IconCart size={14} /> Ajouter
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Services */}
      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} transition={{ duration: 0.5 }}>
        <h2 className="text-xl md:text-2xl font-bold mb-5 md:mb-7 text-center">Nos Services</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
          {[
            { icon: <IconPackage size={24} />, title: 'Vente Materiel', desc: 'Ordinateurs, ecrans, imprimantes.', color: 'bg-blue-50 text-blue-600' },
            { icon: <IconOrders size={24} />, title: 'Depannage', desc: 'Diagnostic a distance, chat en direct.', color: 'bg-green-50 text-green-600' },
            { icon: <IconMap size={24} />, title: 'En Boutique', desc: 'Paiement sur place, retrait immediat.', color: 'bg-purple-50 text-purple-600' },
            { icon: <IconStar size={24} />, title: 'Garantie', desc: 'Tous nos produits sont garantis.', color: 'bg-orange-50 text-orange-600' },
          ].map(s => (
            <div key={s.title} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6 text-center hover:shadow-md transition group">
              <div className={`w-12 h-12 md:w-14 md:h-14 ${s.color} rounded-2xl flex items-center justify-center mx-auto mb-3 md:mb-4 group-hover:scale-110 transition`}>{s.icon}</div>
              <h3 className="font-bold text-sm md:text-base mb-1">{s.title}</h3>
              <p className="text-gray-500 text-xs md:text-sm">{s.desc}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Comment ca marche */}
      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} transition={{ duration: 0.5 }}
        className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl md:rounded-3xl p-6 md:p-10">
        <h2 className="text-xl md:text-2xl font-bold mb-5 md:mb-7 text-center">Comment ca marche ?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-8">
          {[
            { step: 1, title: 'Creez un compte', desc: 'Inscrivez-vous gratuitement.' },
            { step: 2, title: 'Commandez ou demandez de l\'aide', desc: 'Achetez du materiel ou creez un ticket.' },
            { step: 3, title: 'Paiement en boutique', desc: 'Payez et recuperez votre materiel.' },
          ].map(s => (
            <div key={s.step} className="flex md:block items-center gap-4 md:text-center">
              <div className="w-10 h-10 md:w-14 md:h-14 bg-blue-600 text-white rounded-full flex items-center justify-center text-lg md:text-xl font-bold flex-shrink-0 md:mx-auto mb-0 md:mb-3">{s.step}</div>
              <div><h3 className="font-bold text-sm md:text-base mb-0.5">{s.title}</h3><p className="text-gray-500 text-xs md:text-sm">{s.desc}</p></div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Contact */}
      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} transition={{ duration: 0.5 }}
        className="bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-2xl md:rounded-3xl p-6 md:p-12 text-center">
        <h2 className="text-xl md:text-2xl font-bold mb-2 md:mb-3">Besoin d&apos;aide ?</h2>
        <p className="text-gray-300 text-sm md:text-base mb-5 md:mb-6 max-w-lg mx-auto">Notre equipe de techniciens est disponible pour vous assister.</p>
        <div className="flex flex-col md:flex-row gap-3 md:gap-4 justify-center">
          <Link href={isAuthenticated ? '/tickets' : '/login'}
            className="bg-blue-600 text-white px-6 md:px-8 py-2.5 md:py-3 rounded-full text-sm font-semibold hover:bg-blue-700 transition">Demander de l&apos;aide</Link>
          <Link href="/map" className="border border-gray-500 text-white px-6 md:px-8 py-2.5 md:py-3 rounded-full text-sm font-semibold hover:bg-white/10 transition">Notre boutique</Link>
        </div>
      </motion.div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { IconMap, IconPackage, IconTicket, IconCheck, IconStar } from '@/src/components/Icons';
import SEO from '@/src/components/SEO';
import { localBusinessJsonLd } from '@/src/lib/seo';

export default function MapPage() {
  const [activeTab, setActiveTab] = useState<'main' | 'paris'>('main');

  const workshops = [
    {
      id: 'main',
      name: 'Atelier & Showroom Principal — AM Info',
      address: '24 Avenue de la Technologie, 75008 Paris',
      phone: '+33 1 42 68 55 00',
      email: 'atelier@am-info.fr',
      lat: 48.8705,
      lng: 2.3168,
      hours: [
        { day: 'Lundi - Vendredi', time: '08:30 – 19:00' },
        { day: 'Samedi', time: '09:00 – 17:30' },
        { day: 'Dimanche', time: 'Fermé (Urgences SAV par ticket)' },
      ],
      features: [
        'Dépôt & diagnostic express sans RDV (< 15 min)',
        'Retrait Click & Collect 1 heure',
        'Banc d’essai composants & test gaming en direct',
        'Paiement sécurisé (CB, Virement, Mobile Money)',
      ],
    },
  ];

  const current = workshops[0];

  return (
    <div className="space-y-8 pb-12">
      <SEO
        title="Nos Boutiques & Ateliers Informatiques"
        description="Localisez nos ateliers AM Info pour le dépôt de votre matériel en réparation, le retrait Click & Collect ou un diagnostic immédiat."
        jsonLd={localBusinessJsonLd()}
        geoRegion="FR-75"
        geoPlacename="Paris, France"
        geoPosition="48.8705;2.3168"
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full">
            Points de Vente & Dépôt SAV
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white mt-2">
            Trouver un Atelier AM Info
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Venez tester nos équipements, déposer votre ordinateur pour réparation ou retirer vos achats.
          </p>
        </div>
        <Link
          href="/tickets"
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-700 transition shadow-sm self-start md:self-auto"
        >
          <IconTicket size={16} /> Ouvrir un ticket avant visite
        </Link>
      </div>

      {/* Interactive Map Visual + Details Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive Stylized Map */}
        <div className="lg:col-span-2 bg-slate-900 rounded-3xl overflow-hidden min-h-[420px] relative border border-slate-800 shadow-xl flex items-center justify-center p-6 text-center">
          {/* Background Grid Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-40" />

          {/* Pulse Pin */}
          <div className="relative z-10 max-w-md space-y-4">
            <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
              <span className="absolute w-full h-full bg-blue-500/30 rounded-full animate-ping" />
              <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/40 relative z-10">
                <IconMap size={32} />
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">{current.name}</h3>
              <p className="text-slate-300 text-sm mt-1">{current.address}</p>
              <p className="text-xs text-blue-400 font-mono mt-1">
                GPS: {current.lat.toFixed(4)}° N, {current.lng.toFixed(4)}° E
              </p>
            </div>
            <div className="inline-flex items-center gap-2 text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3.5 py-1.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Atelier Ouvert aujourd’hui
            </div>
            <div className="pt-2 flex justify-center gap-3">
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${current.lat},${current.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-4 py-2 rounded-xl transition backdrop-blur-sm"
              >
                Itinéraire Google Maps
              </a>
            </div>
          </div>
        </div>

        {/* Info & Services */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm space-y-4">
            <h3 className="font-bold text-gray-900 dark:text-white text-base flex items-center gap-2">
              <IconPackage size={18} className="text-blue-600" /> Horaires de l&apos;Atelier
            </h3>
            <div className="space-y-2 text-xs">
              {current.hours.map((h, i) => (
                <div key={i} className="flex justify-between py-1 border-b border-gray-50 dark:border-gray-700/50 last:border-0">
                  <span className="text-gray-500 dark:text-gray-400">{h.day}</span>
                  <span className="font-bold text-gray-800 dark:text-gray-200">{h.time}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm space-y-3">
            <h3 className="font-bold text-gray-900 dark:text-white text-base">Services disponibles sur place</h3>
            <ul className="space-y-2 text-xs text-gray-600 dark:text-gray-300">
              {current.features.map((feat, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-emerald-500 font-bold shrink-0">✓</span>
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-5 border border-blue-100 dark:border-blue-800/40">
            <p className="text-xs text-blue-900 dark:text-blue-200 leading-relaxed font-medium">
              💡 <strong>Conseil :</strong> Pour une prise en charge accélérée de votre matériel, décrivez la panne via notre interface de ticket avant de vous déplacer.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

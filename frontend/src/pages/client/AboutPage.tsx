'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { IconPackage, IconOrders, IconTicket, IconMap, IconStar, IconCheck } from '@/src/components/Icons';
import SEO from '@/src/components/SEO';
import { localBusinessJsonLd } from '@/src/lib/seo';

export default function AboutPage() {
  const values = [
    {
      title: 'Expertise Technique Certifiée',
      desc: 'Nos techniciens disposent de plus de 10 ans d’expérience en dépannage multi-marques, micro-soudure et optimisation hardware.',
      icon: <IconPackage size={24} />,
      color: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    },
    {
      title: 'Transparence & Diagnostic Clair',
      desc: 'Pas de surprise : devis immédiat, explication détaillée de la panne et validation avant toute intervention sur votre matériel.',
      icon: <IconOrders size={24} />,
      color: 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400',
    },
    {
      title: 'Écologie & Réparabilité',
      desc: 'Nous favorisons la réparation plutôt que le remplacement systématique pour prolonger la durée de vie de vos équipements informatiques.',
      icon: <IconStar size={24} />,
      color: 'bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
    },
    {
      title: 'Support Réactif & Local',
      desc: 'Assistance en ligne par ticket, visioconférence avec un technicien ou accueil direct dans notre atelier physique.',
      icon: <IconTicket size={24} />,
      color: 'bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
    },
  ];

  const milestones = [
    { year: '2020', title: 'Fondation d’AM Info', desc: 'Ouverture du premier atelier de maintenance informatique et service de dépannage rapide.' },
    { year: '2022', title: 'Lancement E-commerce', desc: 'Mise en place de la boutique en ligne de composants certifiés et stations gaming montées sur mesure.' },
    { year: '2024', title: 'Support Connecté & SAV', desc: 'Intégration du système de ticketing en temps réel et assistance vidéo interactive.' },
    { year: '2026', title: 'Nouvelle Plateforme V2', desc: 'Plateforme haute performance avec recommandations intelligentes et paiement omnicanal.' },
  ];

  return (
    <div className="space-y-12 md:space-y-16 pb-12">
      <SEO
        title="À Propos — Qui sommes-nous ?"
        description="Découvrez AM Info, votre spécialiste en maintenance, dépannage informatique, vente de matériel et assistance technique personnalisée."
        jsonLd={localBusinessJsonLd()}
      />

      {/* Hero */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs uppercase tracking-widest font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-3.5 py-1 rounded-full">
          Notre Mission & Histoire
        </span>
        <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          L&apos;informatique simple, durable et performante
        </h1>
        <p className="text-base md:text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
          Chez <strong className="text-blue-600 dark:text-blue-400 font-semibold">AM Info</strong>, nous combinons passion technologique, rigueur technique et proximité humaine pour vous offrir le meilleur de l&apos;assistance informatique et du matériel professionnel.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {[
          { label: 'Interventions réussies', value: '4 800+' },
          { label: 'Clients satisfaits', value: '99.4%' },
          { label: 'Délai moyen diagnostic', value: '< 24h' },
          { label: 'Garantie atelier', value: '12 Mois' },
        ].map((s, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 text-center shadow-sm">
            <p className="text-2xl md:text-3xl font-extrabold text-blue-600 dark:text-blue-400">{s.value}</p>
            <p className="text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Values Grid */}
      <div className="space-y-6">
        <div className="text-center max-w-xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Nos Engagements</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Ce qui fait la différence au quotidien pour chaque client</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {values.map((v, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-start gap-5"
            >
              <div className={`p-3.5 rounded-2xl shrink-0 ${v.color}`}>
                {v.icon}
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{v.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{v.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-gray-50 dark:bg-gray-800/60 rounded-3xl p-6 md:p-12 border border-gray-100 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">Notre Parcours</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
          {milestones.map((m, i) => (
            <div key={i} className="relative pl-6 md:pl-0 md:pt-6 border-l-2 md:border-l-0 md:border-t-2 border-blue-500">
              <span className="absolute -left-[9px] md:left-0 -top-[2px] md:-top-[9px] w-4 h-4 rounded-full bg-blue-600 border-4 border-white dark:border-gray-800" />
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400">{m.year}</span>
              <h4 className="text-base font-bold text-gray-900 dark:text-white mt-1 mb-1.5">{m.title}</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{m.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 md:p-12 text-white text-center shadow-lg shadow-blue-500/20">
        <h3 className="text-2xl md:text-3xl font-bold mb-3">Besoin d&apos;une intervention ou d&apos;un conseil d&apos;achat ?</h3>
        <p className="text-blue-100 text-sm md:text-base max-w-xl mx-auto mb-6">
          Notre équipe est à votre disposition pour analyser vos besoins ou diagnostiquer votre équipement dès aujourd&apos;hui.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/tickets"
            className="bg-white text-blue-600 px-6 py-3 rounded-xl font-bold text-sm hover:bg-blue-50 transition shadow-md"
          >
            Ouvrir un ticket SAV
          </Link>
          <Link
            href="/products"
            className="border border-white/40 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-white/10 transition"
          >
            Découvrir la boutique
          </Link>
        </div>
      </div>
    </div>
  );
}

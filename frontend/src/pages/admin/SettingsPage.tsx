'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { getSettings, updateSettings, SiteSettings } from '@/src/api/settings';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { Toggle } from '@/src/components/ui/Toggle';

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<SiteSettings>({
    site_name: 'AM Info',
    site_description: 'Assistance & Maintenance Informatique',
    contact_email: 'contact@am-info.fr',
    contact_phone: '+33 1 42 68 55 00',
    address: '24 Avenue de la Technologie',
    city: 'Paris',
    country: 'France',
    postal_code: '75008',
    latitude: 48.8705,
    longitude: 2.3168,
    maintenance_mode: false,
    allow_registrations: true,
    currency: 'EUR',
    delivery_fee: 0,
    free_delivery_threshold: 50,
  });

  useEffect(() => {
    getSettings()
      .then((data: any) => {
        if (data) setFormData((prev) => ({ ...prev, ...data }));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (field: keyof SiteSettings, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateSettings(formData);
      toast.success('Paramètres enregistrés avec succès');
    } catch {
      toast.error('Erreur lors de l’enregistrement');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-400">Chargement des paramètres...</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Paramètres Généraux</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Configurez l’identité de la plateforme, les informations de contact et les coordonnées géographiques.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Identité de l'entreprise */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm space-y-4">
          <h2 className="font-bold text-base text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-3">
            Identité & Métadonnées SEO
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nom de la plateforme"
              value={formData.site_name}
              onChange={(e) => handleChange('site_name', e.target.value)}
              required
            />
            <Input
              label="Devise par défaut"
              value={formData.currency}
              onChange={(e) => handleChange('currency', e.target.value)}
              required
            />
            <div className="md:col-span-2">
              <Input
                label="Description principale (SEO)"
                value={formData.site_description}
                onChange={(e) => handleChange('site_description', e.target.value)}
                required
              />
            </div>
          </div>
        </div>

        {/* Contact & Localisation GEO */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm space-y-4">
          <h2 className="font-bold text-base text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-3">
            Coordonnées & Référencement Local (GEO)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Email de contact"
              type="email"
              value={formData.contact_email}
              onChange={(e) => handleChange('contact_email', e.target.value)}
              required
            />
            <Input
              label="Téléphone assistance"
              value={formData.contact_phone}
              onChange={(e) => handleChange('contact_phone', e.target.value)}
              required
            />
            <Input
              label="Adresse physique de l'atelier"
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              required
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                label="Code Postal"
                value={formData.postal_code}
                onChange={(e) => handleChange('postal_code', e.target.value)}
                required
              />
              <Input
                label="Ville"
                value={formData.city}
                onChange={(e) => handleChange('city', e.target.value)}
                required
              />
            </div>
            <Input
              label="Latitude GPS"
              type="number"
              step="any"
              value={formData.latitude}
              onChange={(e) => handleChange('latitude', parseFloat(e.target.value) || 0)}
              required
            />
            <Input
              label="Longitude GPS"
              type="number"
              step="any"
              value={formData.longitude}
              onChange={(e) => handleChange('longitude', parseFloat(e.target.value) || 0)}
              required
            />
          </div>
        </div>

        {/* Règles & Sécurité */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm space-y-4">
          <h2 className="font-bold text-base text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-3">
            Paramètres Système
          </h2>
          <div className="space-y-4">
            <Toggle
              checked={formData.allow_registrations}
              onChange={(val) => handleChange('allow_registrations', val)}
              label="Autoriser les nouvelles inscriptions clients"
            />
            <Toggle
              checked={formData.maintenance_mode}
              onChange={(val) => handleChange('maintenance_mode', val)}
              label="Mode maintenance (bloque l'accès aux clients)"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <Button type="submit" loading={saving} size="lg">
            Enregistrer les modifications
          </Button>
        </div>
      </form>
    </div>
  );
}

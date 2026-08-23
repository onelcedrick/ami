import api from './axios';

export interface SiteSettings {
  site_name: string;
  site_description: string;
  contact_email: string;
  contact_phone: string;
  address: string;
  city: string;
  country: string;
  postal_code: string;
  latitude: number;
  longitude: number;
  maintenance_mode: boolean;
  allow_registrations: boolean;
  currency: string;
  delivery_fee: number;
  free_delivery_threshold: number;
}

export const getSettings = async () => {
  try {
    const res = await api.get('/api/v1/settings');
    return res;
  } catch {
    return {
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
    };
  }
};

export const updateSettings = async (data: Partial<SiteSettings>) => {
  return await api.put('/api/v1/settings', data);
};

import { NextRequest, NextResponse } from 'next/server';

// In-memory Database Store
const categories = [
  { id: 'cat-1', name: 'PC Portables & Ultrabooks', slug: 'laptops', description: 'Portables professionnels, ultra-légers et gamers', image_url: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&q=80', is_active: true },
  { id: 'cat-2', name: 'PC Fixes & Stations Gaming', slug: 'desktops', description: 'Tours assemblées haute performance et stations CAO', image_url: 'https://images.unsplash.com/photo-1587831990711-23ca6441447b?w=500&q=80', is_active: true },
  { id: 'cat-3', name: 'Composants & Pièces', slug: 'components', description: 'Processeurs, cartes graphiques, RAM, SSD et alimentations', image_url: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=500&q=80', is_active: true },
  { id: 'cat-4', name: 'Périphériques & Accessoires', slug: 'accessories', description: 'Écrans 4K, claviers mécaniques, souris sans fil et casques', image_url: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500&q=80', is_active: true },
  { id: 'cat-5', name: 'Réseau & Stockage', slug: 'networking', description: 'Routeurs Wi-Fi 6, NAS, commutateurs et disques externes', image_url: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=500&q=80', is_active: true },
  { id: 'cat-6', name: 'Maintenance & Assistance SAV', slug: 'services', description: 'Forfaits dépannage, nettoyage, réinstallation et upgrade', image_url: 'https://images.unsplash.com/photo-1588702547919-26089e690ecc?w=500&q=80', is_active: true },
];

let products = [
  {
    id: 'prod-1',
    name: 'PC Portable Pro Stealth 15" Core i7 32Go 1To SSD',
    slug: 'pc-portable-pro-stealth-15',
    description: 'Ordinateur portable professionnel équipé du processeur Intel Core i7 13e génération, 32 Go de RAM DDR5 et SSD NVMe 1 To. Écran OLED 2.8K 120Hz antireflet.',
    short_description: 'Intel i7 13e gén, 32Go DDR5, 1To NVMe, écran OLED 15.6"',
    price: 4950000,
    compare_price: 5500000,
    category_id: 'cat-1',
    category: categories[0],
    brand: 'AM ProTech',
    stock_quantity: 14,
    images: ['https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=600&q=80'],
    image_url: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=600&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=300&q=80',
    is_active: true,
    is_featured: true,
    discount_percent: 10,
    rating_avg: 4.8,
    rating_count: 24,
    created_at: '2026-01-15T10:00:00Z',
  },
  {
    id: 'prod-2',
    name: 'Station Gaming Ryzen 7 RTX 4070 Ti Super 32Go',
    slug: 'station-gaming-ryzen-7-rtx-4070',
    description: 'PC Gamer ultra puissant assemblé dans nos ateliers. Watercooling ARGB 360mm, alimentation 850W Gold modulaire, boîtier mesh ultra ventilé.',
    short_description: 'AMD Ryzen 7 7800X3D, RTX 4070 Ti Super 16Go, 32Go DDR5 6000MHz',
    price: 7200000,
    compare_price: 7990000,
    category_id: 'cat-2',
    category: categories[1],
    brand: 'AM Gaming',
    stock_quantity: 8,
    images: ['https://images.unsplash.com/photo-1587831990711-23ca6441447b?w=600&q=80'],
    image_url: 'https://images.unsplash.com/photo-1587831990711-23ca6441447b?w=600&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1587831990711-23ca6441447b?w=300&q=80',
    is_active: true,
    is_featured: true,
    discount_percent: 10,
    rating_avg: 4.9,
    rating_count: 38,
    created_at: '2026-02-01T10:00:00Z',
  },
  {
    id: 'prod-3',
    name: 'Carte Graphique GeForce RTX 4060 8GB GDDR6',
    slug: 'gpu-rtx-4060-8gb',
    description: 'Architecture Ada Lovelace, DLSS 3, Ray Tracing nouvelle génération. Parfaite pour le jeu fluide et le rendu créatif.',
    short_description: 'Nvidia RTX 4060 8Go OC Edition double ventilateur',
    price: 1650000,
    compare_price: 1850000,
    category_id: 'cat-3',
    category: categories[2],
    brand: 'NVIDIA Partner',
    stock_quantity: 22,
    images: ['https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=600&q=80'],
    image_url: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=600&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=300&q=80',
    is_active: true,
    is_featured: true,
    discount_percent: 11,
    rating_avg: 4.6,
    rating_count: 19,
    created_at: '2026-02-10T10:00:00Z',
  },
  {
    id: 'prod-4',
    name: 'Écran Incurvé 27" QHD 165Hz 1ms IPS',
    slug: 'ecran-incurve-27-qhd-165hz',
    description: 'Moniteur incurvé 1500R 2560x1440 compatible G-Sync et FreeSync. Dalle Fast IPS avec couverture 99% sRGB et pied réglable ergonomique.',
    short_description: '27 pouces, 2560x1440, 165Hz, 1ms, HDR400, DisplayPort + HDMI',
    price: 1150000,
    compare_price: 1350000,
    category_id: 'cat-4',
    category: categories[3],
    brand: 'ViewVision',
    stock_quantity: 11,
    images: ['https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&q=80'],
    image_url: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=300&q=80',
    is_active: true,
    is_featured: true,
    discount_percent: 15,
    rating_avg: 4.7,
    rating_count: 15,
    created_at: '2026-02-14T10:00:00Z',
  },
  {
    id: 'prod-5',
    name: 'SSD Interne NVMe PCIe 4.0 2 To (Vitesse 7400 Mo/s)',
    slug: 'ssd-nvme-2to-gen4',
    description: 'Débits ultra rapides en lecture jusqu’à 7400 Mo/s et écriture 6800 Mo/s. Dissipateur thermique aluminium inclus compatible PC et PS5.',
    short_description: '2 To M.2 NVMe PCIe 4.0 TLC 3D NAND avec dissipateur',
    price: 580000,
    compare_price: 690000,
    category_id: 'cat-3',
    category: categories[2],
    brand: 'SpeedMaster',
    stock_quantity: 35,
    images: ['https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=600&q=80'],
    image_url: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=600&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=300&q=80',
    is_active: true,
    is_featured: false,
    discount_percent: 16,
    rating_avg: 4.9,
    rating_count: 42,
    created_at: '2026-02-18T10:00:00Z',
  },
  {
    id: 'prod-6',
    name: 'Pack Clavier Mécanique RGB + Souris Sans Fil 8K',
    slug: 'pack-clavier-mecanique-souris-8k',
    description: 'Ensemble périphérique sans fil ultra-faible latence 2.4G / Bluetooth. Switches mécaniques tactiles remplaçables à chaud et capteur 26 000 DPI.',
    short_description: 'Clavier Hot-swap silencieux + Souris ultralight 58g avec station',
    price: 390000,
    compare_price: 490000,
    category_id: 'cat-4',
    category: categories[3],
    brand: 'AM Gaming',
    stock_quantity: 20,
    images: ['https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&q=80'],
    image_url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=300&q=80',
    is_active: true,
    is_featured: false,
    discount_percent: 20,
    rating_avg: 4.5,
    rating_count: 12,
    created_at: '2026-02-20T10:00:00Z',
  },
  {
    id: 'prod-7',
    name: 'Forfait Diagnostic & Maintenance Intégrale Atelier',
    slug: 'forfait-maintenance-integrale',
    description: 'Prise en charge complète en atelier : dépoussiérage ultrasons, remplacement pâte thermique haute conductivité, diagnostic matériel complet et optimisation OS.',
    short_description: 'Nettoyage complet, pâte thermique pro, test composants et rapport',
    price: 150000,
    compare_price: 200000,
    category_id: 'cat-6',
    category: categories[5],
    brand: 'Service AM Info',
    stock_quantity: 999,
    images: ['https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&q=80'],
    image_url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=300&q=80',
    is_active: true,
    is_featured: true,
    discount_percent: 25,
    rating_avg: 5.0,
    rating_count: 57,
    created_at: '2026-02-22T10:00:00Z',
  },
  {
    id: 'prod-8',
    name: 'Routeur Wi-Fi 6 Mesh Tri-Bande AX6000 Pro',
    slug: 'routeur-wifi-6-mesh-ax6000',
    description: 'Couverture sans fil jusqu’à 280 m² avec débits cumulés de 6000 Mbps. 1 port WAN 2.5 Gbps, 4 ports LAN Gigabit et sécurité réseau intégrée.',
    short_description: 'Wi-Fi 6 AX6000, 2.5G WAN, processeur Quad-Core 2.0 GHz',
    price: 650000,
    compare_price: 780000,
    category_id: 'cat-5',
    category: categories[4],
    brand: 'NetPro',
    stock_quantity: 15,
    images: ['https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600&q=80'],
    image_url: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=300&q=80',
    is_active: true,
    is_featured: false,
    discount_percent: 17,
    rating_avg: 4.8,
    rating_count: 14,
    created_at: '2026-02-23T10:00:00Z',
  }
];

let users = [
  { id: 'user-admin', email: 'admin@aminfo.com', password: 'password123', first_name: 'Admin', last_name: 'AM Info', role: 'admin', is_active: true, created_at: '2026-01-01T00:00:00Z' },
  { id: 'user-tech', email: 'tech@aminfo.com', password: 'password123', first_name: 'Jean', last_name: 'Technicien', role: 'technician', is_active: true, created_at: '2026-01-02T00:00:00Z' },
  { id: 'user-client', email: 'client@aminfo.com', password: 'password123', first_name: 'Marc', last_name: 'Ranaivo', role: 'client', is_active: true, created_at: '2026-01-05T00:00:00Z' },
];

let appliedCoupon: any = null;

let cartItems: any[] = [
  { id: 'cart-1', user_id: 'user-client', product_id: 'prod-3', quantity: 1, product: products[2] }
];

let wishlistItems: any[] = [products[0], products[3]];

let ratingsStore: Record<string, any> = {
  'tkt-8822': { rated: true, score: 5, comment: 'Intervention rapide et impeccable !' }
};

// Madagascar mobile money & payments
const paymentMethods = [
  { id: 'mvola', name: 'MVola (Telma)', icon: '🟢', prefix: '+261', placeholder: '34 XX XXX XX', color: '#00a859', description: 'Paiement instantané sécurisé par MVola Telma' },
  { id: 'orange', name: 'Orange Money Madagascar', icon: '🟠', prefix: '+261', placeholder: '32 XX XXX XX', color: '#ff7900', description: 'Paiement direct depuis votre compte Orange Money' },
  { id: 'airtel', name: 'Airtel Money Madagascar', icon: '🔴', prefix: '+261', placeholder: '33 XX XXX XX', color: '#e60000', description: 'Paiement sécurisé via Airtel Money' },
  { id: 'card', name: 'Carte Bancaire (Visa / Mastercard)', icon: '💳', prefix: '', placeholder: 'Numéro de carte', color: '#2563eb', description: 'Paiement sécurisé par carte bancaire internationale / locale' },
  { id: 'boutique', name: 'Paiement au Retrait en Boutique (Antananarivo)', icon: '🏬', prefix: '', placeholder: '', color: '#10b981', description: 'Réglez en espèces ou TPE lors du retrait de votre matériel à AM Info' }
];

let discounts: any[] = [
  { id: 'disc-1', name: 'Bienvenue nouveau client', code: 'BIENVENUE10', discount_type: 'percentage', value: 10, target_type: 'global', min_order_amount: 0, is_active: true, description: '10% de réduction immédiate sur tous les produits' },
  { id: 'disc-2', name: 'Promo Spéciale Composants & Cartes', code: 'PROMOCOMP15', discount_type: 'percentage', value: 15, target_type: 'category', target_id: 'cat-3', min_order_amount: 100000, is_active: true, description: '15% de remise sur les processeurs, GPU, RAM et SSD' },
  { id: 'disc-3', name: 'Remise Fidélité 50 000 Ar', code: 'AMINFO50K', discount_type: 'fixed_amount', value: 50000, target_type: 'global', min_order_amount: 500000, is_active: true, description: '50 000 Ar de remise dès 500 000 Ar d’achat' },
];

let orders: any[] = [
  {
    id: 'ord-1001',
    order_number: 'CMD-2026-0089',
    invoice_number: 'FAC-2026-0089',
    user_id: 'user-client',
    client_name: 'Marc Ranaivo',
    client_email: 'client@aminfo.com',
    client_phone: '+261 34 12 345 67',
    status: 'paid',
    payment_status: 'paid',
    subtotal: 4950000,
    tax_amount: 0,
    shipping_amount: 0,
    discount_amount: 0,
    total: 4950000,
    currency: 'Ar',
    shipping_address: 'Retrait en boutique AM Info - Antananarivo',
    payment_method: 'mvola',
    payment_transaction_id: 'MV-20260218-882190',
    created_at: '2026-02-18T14:32:00Z',
    items: [
      { id: 'item-1', order_id: 'ord-1001', product_id: 'prod-1', product_name: 'PC Portable Pro Stealth 15" Core i7', product_price: 4950000, quantity: 1, total: 4950000 }
    ]
  },
  {
    id: 'ord-1002',
    order_number: 'CMD-2026-0092',
    invoice_number: 'FAC-2026-0092',
    user_id: 'user-client',
    client_name: 'Marc Ranaivo',
    client_email: 'client@aminfo.com',
    client_phone: '+261 34 12 345 67',
    status: 'shipped',
    payment_status: 'paid',
    subtotal: 1150000,
    tax_amount: 0,
    shipping_amount: 0,
    discount_amount: 0,
    total: 1150000,
    currency: 'Ar',
    shipping_address: 'Lot II M 45 Antanimena, Antananarivo 101',
    payment_method: 'orange',
    payment_transaction_id: 'OM-20260221-551029',
    created_at: '2026-02-21T09:15:00Z',
    items: [
      { id: 'item-2', order_id: 'ord-1002', product_id: 'prod-4', product_name: 'Écran Incurvé 27" QHD 165Hz', product_price: 1150000, quantity: 1, total: 1150000 }
    ]
  },
  {
    id: 'ord-1003',
    order_number: 'CMD-2026-0095',
    invoice_number: 'FAC-2026-0095',
    user_id: 'user-client',
    client_name: 'Marc Ranaivo',
    client_email: 'client@aminfo.com',
    client_phone: '+261 34 12 345 67',
    status: 'pending',
    payment_status: 'pending',
    subtotal: 150000,
    tax_amount: 0,
    shipping_amount: 0,
    discount_amount: 0,
    total: 150000,
    currency: 'Ar',
    shipping_address: 'Dépôt Atelier AM Info - Analakely',
    payment_method: 'boutique',
    created_at: '2026-02-23T08:00:00Z',
    items: [
      { id: 'item-3', order_id: 'ord-1003', product_id: 'prod-7', product_name: 'Forfait Diagnostic & Maintenance Intégrale Atelier', product_price: 150000, quantity: 1, total: 150000 }
    ]
  }
];

let tickets: any[] = [
  {
    id: 'tkt-8821',
    client_id: 'user-client',
    technician_id: 'user-tech',
    subject: 'Écran noir et bip au démarrage après mise à jour',
    description: 'Mon PC s’allume mais l’écran reste noir avec 3 bips continus. Besoin d’assistance technique urgente.',
    status: 'in_progress',
    priority: 'urgent',
    category: 'hardware',
    created_at: '2026-02-22T11:00:00Z',
    messages: [
      {
        id: 'msg-1',
        ticket_id: 'tkt-8821',
        sender_id: 'user-client',
        sender_role: 'client',
        message: 'Bonjour, voici la photo de la carte mère avec les voyants LED allumés.',
        attachment_url: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=500&q=80',
        created_at: '2026-02-22T11:05:00Z'
      },
      {
        id: 'msg-2',
        ticket_id: 'tkt-8821',
        sender_id: 'user-tech',
        sender_role: 'technician',
        message: 'Bonjour Marc, d’après les LED de debug, il s’agit d’un défaut d’initialisation de la mémoire vive. Pouvez-vous tester les barrettes une par une sur le slot 2 ?',
        attachment_url: null,
        created_at: '2026-02-22T11:20:00Z'
      }
    ]
  },
  {
    id: 'tkt-8822',
    client_id: 'user-client',
    technician_id: 'user-tech',
    subject: 'Remplacement pâte thermique et nettoyage complet',
    description: 'Demande de devis pour nettoyage thermique tour gamer et dépoussiérage.',
    status: 'resolved',
    priority: 'medium',
    category: 'maintenance',
    created_at: '2026-02-19T14:00:00Z',
    messages: [
      {
        id: 'msg-3',
        ticket_id: 'tkt-8822',
        sender_id: 'user-client',
        sender_role: 'client',
        message: 'Intervention terminée avec succès, températures réduites de 15°C !',
        attachment_url: null,
        created_at: '2026-02-19T16:30:00Z'
      }
    ]
  }
];

let siteSettings = {
  site_name: 'AM Info',
  site_description: 'Assistance & Vente Matériel Informatique Madagascar',
  contact_email: 'contact@am-info.mg',
  contact_phone: '+261 34 00 123 45',
  address: 'Analakely, En face de l’Hôtel de Ville',
  city: 'Antananarivo',
  country: 'Madagascar',
  postal_code: '101',
  latitude: -18.9137,
  longitude: 47.5256,
  maintenance_mode: false,
  allow_registrations: true,
  currency: 'Ar',
  currency_code: 'MGA',
  currency_symbol: 'Ar',
  delivery_fee: 10000,
  free_delivery_threshold: 200000,
};

function calculateCartTotals() {
  const subtotal = cartItems.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);
  let discount_amount = 0;

  if (appliedCoupon && appliedCoupon.is_active) {
    if (appliedCoupon.target_type === 'global') {
      if (appliedCoupon.discount_type === 'percentage') {
        discount_amount = (subtotal * appliedCoupon.value) / 100;
      } else {
        discount_amount = appliedCoupon.value;
      }
    } else if (appliedCoupon.target_type === 'category') {
      const eligibleSum = cartItems
        .filter(item => item.product?.category_id === appliedCoupon.target_id || item.product?.category?.name === appliedCoupon.target_id)
        .reduce((s, item) => s + (item.product?.price || 0) * item.quantity, 0);
      if (appliedCoupon.discount_type === 'percentage') {
        discount_amount = (eligibleSum * appliedCoupon.value) / 100;
      } else {
        discount_amount = Math.min(eligibleSum, appliedCoupon.value);
      }
    } else if (appliedCoupon.target_type === 'product') {
      const eligibleSum = cartItems
        .filter(item => item.product?.id === appliedCoupon.target_id)
        .reduce((s, item) => s + (item.product?.price || 0) * item.quantity, 0);
      if (appliedCoupon.discount_type === 'percentage') {
        discount_amount = (eligibleSum * appliedCoupon.value) / 100;
      } else {
        discount_amount = Math.min(eligibleSum, appliedCoupon.value);
      }
    }
  }

  discount_amount = Math.min(discount_amount, subtotal);
  const total = Math.max(0, subtotal - discount_amount);
  const count = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return {
    items: cartItems.map(i => ({
      ...i,
      subtotal: (i.product?.price || 0) * i.quantity,
    })),
    subtotal,
    discount_amount,
    discount: appliedCoupon ? { ...appliedCoupon, amount: discount_amount } : null,
    total,
    total_price: total,
    count,
    total_items: count,
    currency: 'Ar'
  };
}

function createToken(user: any) {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({
    sub: user.id,
    email: user.email,
    first_name: user.first_name || '',
    last_name: user.last_name || '',
    role: user.role || 'client',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 86400 * 30
  }));
  return `${header}.${payload}.mockSignatureString`;
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': '*',
    },
  });
}

export async function GET(req: NextRequest, { params }: { params: { path: string[] } }) {
  const path = (params.path || []).join('/');
  const url = new URL(req.url);

  // Auth: /api/v1/auth/me
  if (path === 'auth/me') {
    const authHeader = req.headers.get('Authorization');
    if (authHeader) {
      try {
        const token = authHeader.replace('Bearer ', '');
        const payload = JSON.parse(atob(token.split('.')[1]));
        const user = users.find(u => u.id === payload.sub) || payload;
        return NextResponse.json({ id: user.id, email: user.email, first_name: user.first_name, last_name: user.last_name, role: user.role });
      } catch {}
    }
    return NextResponse.json({ id: 'user-client', email: 'client@aminfo.com', first_name: 'Marc', last_name: 'Ranaivo', role: 'client' });
  }

  // Categories: /api/v1/categories
  if (path === 'categories') {
    return NextResponse.json(categories);
  }

  // Products: /api/v1/products/featured
  if (path === 'products/featured') {
    return NextResponse.json(products.filter(p => p.is_featured));
  }

  // Products search: /api/v1/products/search
  if (path === 'products/search') {
    const q = (url.searchParams.get('q') || '').toLowerCase();
    const matches = products.filter(p => p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q) || p.brand?.toLowerCase().includes(q));
    return NextResponse.json({ data: matches.slice(0, 8) });
  }

  // Single Product: /api/v1/products/:id
  if (path.startsWith('products/') && params.path.length === 2) {
    const prodId = params.path[1];
    const product = products.find(p => p.id === prodId || p.slug === prodId);
    if (product) return NextResponse.json(product);
    return NextResponse.json({ error: 'Produit introuvable' }, { status: 404 });
  }

  // Products list: /api/v1/products or /api/v1/search-all
  if (path === 'products' || path === 'search-all') {
    const q = url.searchParams.get('q') || url.searchParams.get('search') || '';
    const cat = url.searchParams.get('category') || '';
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');

    let filtered = [...products];
    if (q) {
      const qLower = q.toLowerCase();
      filtered = filtered.filter(p => p.name.toLowerCase().includes(qLower) || p.description?.toLowerCase().includes(qLower) || p.brand?.toLowerCase().includes(qLower));
    }
    if (cat) {
      filtered = filtered.filter(p => p.category_id === cat || p.category?.name === cat || p.category?.slug === cat || p.category?.id === cat);
    }

    const total = filtered.length;
    const total_pages = Math.ceil(total / limit) || 1;
    const start = (page - 1) * limit;
    const data = filtered.slice(start, start + limit);

    return NextResponse.json({
      data,
      pagination: { total, page, limit, total_pages }
    });
  }

  // Cart count: /api/v1/cart/count
  if (path === 'cart/count') {
    const count = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    return NextResponse.json({ count });
  }

  // Cart: /api/v1/cart
  if (path === 'cart') {
    return NextResponse.json(calculateCartTotals());
  }

  // Wishlist ids: /api/v1/wishlist/ids
  if (path === 'wishlist/ids') {
    return NextResponse.json({ data: wishlistItems.map(p => p.id) });
  }

  // Wishlist: /api/v1/wishlist
  if (path === 'wishlist') {
    return NextResponse.json(wishlistItems);
  }

  // Payment methods: /api/v1/payments/methods or /payments/methods
  if (path === 'payments/methods' || path === 'payment/methods') {
    return NextResponse.json({ data: paymentMethods });
  }

  // Ratings for ticket: /api/v1/ratings/ticket/:id
  if (path.startsWith('ratings/ticket/')) {
    const ticketId = params.path[2];
    const existing = ratingsStore[ticketId] || { rated: false };
    return NextResponse.json({ data: existing });
  }

  // Discounts: /api/v1/admin/discounts or /api/v1/discounts
  if (path === 'admin/discounts' || path === 'discounts') {
    return NextResponse.json(discounts);
  }

  // Orders: /api/v1/orders or /api/v1/admin/orders
  if (path === 'orders' || path === 'admin/orders') {
    return NextResponse.json(orders);
  }

  // Single Order or Invoice: /api/v1/orders/:id or /api/v1/invoices/:id
  if ((path.startsWith('orders/') || path.startsWith('invoices/')) && params.path.length === 2) {
    const orderId = params.path[1];
    const order = orders.find(o => o.id === orderId || o.order_number === orderId || o.invoice_number === orderId);
    if (order) return NextResponse.json(order);
    return NextResponse.json({ error: 'Commande / Facture introuvable' }, { status: 404 });
  }

  // Admin stats: /api/v1/admin/stats
  if (path.startsWith('admin/stats')) {
    const totalRev = orders.filter(o => o.status === 'paid' || o.status === 'confirmed' || o.status === 'delivered').reduce((s, o) => s + (o.total || 0), 0);
    return NextResponse.json({
      total_revenue: totalRev || 6100000,
      total_orders: orders.length,
      total_clients: 8,
      total_products: products.length,
      total_tickets: tickets.length,
      currency: 'Ar'
    });
  }

  // Admin logs: /api/v1/admin/logs
  if (path.startsWith('admin/logs')) {
    return NextResponse.json([
      { id: 'log-1', action: 'create', entity: 'order', entity_id: 'ord-1003', details: 'Nouvelle commande créée - 150 000 Ar', created_at: new Date().toISOString(), user_name: 'Marc Ranaivo', user_email: 'client@aminfo.com' },
      { id: 'log-2', action: 'login', entity: 'user', entity_id: 'user-admin', details: 'Connexion administrateur AM Info', created_at: new Date().toISOString(), user_name: 'Admin AM Info', user_email: 'admin@aminfo.com' },
      { id: 'log-3', action: 'promo', entity: 'discount', entity_id: 'disc-1', details: 'Code promotionnel BIENVENUE10 appliqué', created_at: new Date().toISOString(), user_name: 'Marc Ranaivo', user_email: 'client@aminfo.com' }
    ]);
  }

  // Admin clients: /api/v1/admin/clients
  if (path.startsWith('admin/clients')) {
    return NextResponse.json([
      { id: 'user-client', first_name: 'Marc', last_name: 'Ranaivo', email: 'client@aminfo.com', phone: '+261 34 12 345 67', total_orders: 3, total_spent: 6100000, is_active: true, created_at: '2026-01-05T00:00:00Z' },
      { id: 'user-c2', first_name: 'Aina', last_name: 'Rakoto', email: 'aina@gmail.com', phone: '+261 32 98 765 43', total_orders: 2, total_spent: 1850000, is_active: true, created_at: '2026-01-12T00:00:00Z' },
      { id: 'user-c3', first_name: 'Faly', last_name: 'Andria', email: 'faly.andria@yahoo.fr', phone: '+261 33 44 556 77', total_orders: 1, total_spent: 4950000, is_active: true, created_at: '2026-01-20T00:00:00Z' },
    ]);
  }

  // Settings: /api/v1/settings
  if (path === 'settings') {
    return NextResponse.json(siteSettings);
  }

  // IA Recommendations: /api/v1/ia/recommendations/:userId
  if (path.startsWith('ia/recommendations') || path.startsWith('recommendations')) {
    return NextResponse.json(products.slice(0, 4));
  }

  // IA Similar: /api/v1/ia/similar/:productId
  if (path.startsWith('ia/similar') || path.startsWith('similar')) {
    return NextResponse.json(products.slice(1, 5));
  }

  return NextResponse.json({ message: 'OK', path });
}

export async function POST(req: NextRequest, { params }: { params: { path: string[] } }) {
  const path = (params.path || []).join('/');
  let body: any = {};
  try {
    const text = await req.text();
    if (text) body = JSON.parse(text);
  } catch {}

  // Auth: /api/v1/auth/login
  if (path === 'auth/login') {
    const { email, password } = body;
    let user = users.find(u => u.email.toLowerCase() === (email || '').toLowerCase());
    if (!user) {
      const role = email?.includes('admin') ? 'admin' : email?.includes('tech') ? 'technician' : 'client';
      user = { id: `user-${Date.now()}`, email, password, first_name: email.split('@')[0], last_name: '', role, is_active: true, created_at: new Date().toISOString() };
      users.push(user);
    }
    const token = createToken(user);
    return NextResponse.json({ access_token: token, token, user });
  }

  // Auth: /api/v1/auth/register
  if (path === 'auth/register') {
    const { email, first_name, last_name, password } = body;
    const role = email?.includes('admin') ? 'admin' : email?.includes('tech') ? 'technician' : 'client';
    const newUser = { id: `user-${Date.now()}`, email, first_name: first_name || email.split('@')[0], last_name: last_name || '', role, password, is_active: true, created_at: new Date().toISOString() };
    users.push(newUser);
    const token = createToken(newUser);
    return NextResponse.json({ access_token: token, token, user: newUser });
  }

  // Auth: /api/v1/auth/avatar
  if (path === 'auth/avatar') {
    return NextResponse.json({ data: { avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80' }, avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80', message: 'Avatar mis à jour' });
  }

  // Apply Promo Coupon: /api/v1/cart/coupon or /api/v1/coupons/validate or /api/v1/discounts/validate
  if (path === 'cart/coupon' || path === 'coupons/validate' || path === 'discounts/validate') {
    const code = (body.code || '').trim().toUpperCase();
    if (!code) {
      appliedCoupon = null;
      return NextResponse.json({ message: 'Code promo retiré', cart: calculateCartTotals() });
    }

    const discount = discounts.find(d => d.code.toUpperCase() === code && d.is_active);
    if (!discount) {
      return NextResponse.json({ error: 'Code promo invalide ou expiré' }, { status: 400 });
    }

    const subtotal = cartItems.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);
    if (discount.min_order_amount && subtotal < discount.min_order_amount) {
      return NextResponse.json({ error: `Ce code nécessite un minimum d'achat de ${discount.min_order_amount.toLocaleString('fr-FR')} Ar` }, { status: 400 });
    }

    appliedCoupon = discount;
    const updated = calculateCartTotals();
    return NextResponse.json({
      success: true,
      message: `Code promo "${discount.code}" appliqué (-${discount.value}${discount.discount_type === 'percentage' ? '%' : ' Ar'})`,
      discount,
      cart: updated
    });
  }

  // Remove Coupon: /api/v1/cart/remove-coupon
  if (path === 'cart/remove-coupon') {
    appliedCoupon = null;
    return NextResponse.json({ message: 'Code promo supprimé', cart: calculateCartTotals() });
  }

  // Cart Add: /api/v1/cart/items
  if (path === 'cart/items') {
    const { product_id, quantity = 1 } = body;
    const product = products.find(p => p.id === product_id) || products[0];
    const existing = cartItems.find(i => i.product_id === product_id);
    if (existing) {
      existing.quantity += quantity;
    } else {
      cartItems.push({ id: `cart-${Date.now()}`, product_id, quantity, product });
    }
    return NextResponse.json({ message: 'Produit ajouté', ...calculateCartTotals() });
  }

  // Wishlist toggle: /api/v1/wishlist/:id
  if (path.startsWith('wishlist/')) {
    const prodId = params.path[1];
    const prod = products.find(p => p.id === prodId);
    const index = wishlistItems.findIndex(p => p.id === prodId);
    let added = false;
    if (index > -1) {
      wishlistItems.splice(index, 1);
      added = false;
    } else if (prod) {
      wishlistItems.push(prod);
      added = true;
    }
    return NextResponse.json({ data: { added }, message: added ? 'Ajouté aux favoris' : 'Retiré des favoris' });
  }

  // Payments pay: /api/v1/payments/pay
  if (path === 'payments/pay') {
    const { order_id, method, phone, pin } = body;
    const order = orders.find(o => o.id === order_id);
    const trxId = `MGA-TRX-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const invoiceNum = `FAC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    if (order) {
      order.status = 'paid';
      order.payment_status = 'paid';
      order.payment_method = method || order.payment_method;
      order.payment_transaction_id = trxId;
      if (!order.invoice_number) order.invoice_number = invoiceNum;
    }

    return NextResponse.json({
      data: {
        success: true,
        transaction_id: trxId,
        invoice_number: order?.invoice_number || invoiceNum,
        message: 'Paiement en Ariary validé avec succès !',
        amount: order?.total || 150000,
        currency: 'Ar',
        method: method || 'mvola',
        phone: phone || '+261 34 12 345 67',
      },
      transaction_id: trxId,
      invoice_number: order?.invoice_number || invoiceNum,
      message: 'Paiement validé avec succès en Ariary',
      amount: order?.total || 150000,
      currency: 'Ar',
      method: method || 'mvola',
      phone: phone || ''
    });
  }

  // Generate Invoice: /api/v1/admin/invoices/generate or /api/v1/invoices/generate
  if (path.includes('invoices/generate')) {
    const orderId = body.order_id;
    const order = orders.find(o => o.id === orderId);
    if (order) {
      if (!order.invoice_number) {
        order.invoice_number = `FAC-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      }
      order.invoice_generated_at = new Date().toISOString();
      return NextResponse.json({
        success: true,
        message: `Facture ${order.invoice_number} générée avec succès`,
        invoice_number: order.invoice_number,
        order
      });
    }
    return NextResponse.json({ error: 'Commande introuvable' }, { status: 404 });
  }

  // Ratings submit: /api/v1/ratings
  if (path === 'ratings' || path === 'ratings/') {
    const { ticket_id, score, comment } = body;
    ratingsStore[ticket_id] = { rated: true, score: score || 5, comment: comment || '' };
    return NextResponse.json({ message: 'Merci pour votre évaluation !', data: ratingsStore[ticket_id] });
  }

  // Orders creation: /api/v1/orders
  if (path === 'orders') {
    const cartTotals = calculateCartTotals();
    const orderItems = cartTotals.items.length > 0 
      ? cartTotals.items.map(i => ({
          id: `item-${Date.now()}-${Math.random()}`,
          order_id: '',
          product_id: i.product?.id,
          product_name: i.product?.name,
          product_price: i.product?.price,
          quantity: i.quantity,
          total: (i.product?.price || 0) * i.quantity
        }))
      : [{ id: 'item-new', order_id: '', product_id: 'prod-1', product_name: 'Achat Matériel AM Info', product_price: 150000, quantity: 1, total: 150000 }];

    const orderNum = `CMD-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const invoiceNum = `FAC-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder = {
      id: `ord-${Date.now()}`,
      order_number: orderNum,
      invoice_number: invoiceNum,
      user_id: 'user-client',
      client_name: body.client_name || 'Marc Ranaivo',
      client_email: body.client_email || 'client@aminfo.com',
      client_phone: body.client_phone || '+261 34 12 345 67',
      status: 'pending',
      payment_status: 'pending',
      subtotal: cartTotals.subtotal || 150000,
      tax_amount: 0,
      shipping_amount: 0,
      discount_amount: cartTotals.discount_amount || 0,
      discount_code: appliedCoupon?.code || null,
      total: cartTotals.total || 150000,
      currency: 'Ar',
      shipping_address: body.shipping_address || 'Retrait boutique AM Info - Analakely, Antananarivo',
      payment_method: body.payment_method || 'boutique',
      created_at: new Date().toISOString(),
      items: orderItems
    };

    newOrder.items.forEach(it => { it.order_id = newOrder.id; });
    orders.unshift(newOrder);
    cartItems = [];
    appliedCoupon = null;
    return NextResponse.json(newOrder);
  }

  // Tickets: /api/v1/tickets
  if (path === 'tickets') {
    const newTicket = {
      id: `tkt-${Math.floor(1000 + Math.random() * 9000)}`,
      client_id: 'user-client',
      subject: body.subject || 'Demande de support',
      description: body.description || '',
      status: 'open',
      priority: body.priority || 'medium',
      category: body.category || 'general',
      created_at: new Date().toISOString(),
      messages: [
        {
          id: `msg-${Date.now()}`,
          ticket_id: '',
          sender_id: 'user-client',
          sender_role: 'client',
          message: body.description || body.subject || 'Création de ticket',
          attachment_url: null,
          created_at: new Date().toISOString()
        }
      ]
    };
    newTicket.messages[0].ticket_id = newTicket.id;
    tickets.unshift(newTicket);
    return NextResponse.json(newTicket);
  }

  // Ticket Message: /api/v1/tickets/:id/messages
  if (path.includes('/messages')) {
    const ticketId = params.path[1];
    const ticket = tickets.find(t => t.id === ticketId);
    const newMsg = {
      id: `msg-${Date.now()}`,
      ticket_id: ticketId,
      sender_id: 'user-client',
      sender_role: 'client',
      message: body.message || '',
      attachment_url: body.attachment_url || null,
      created_at: new Date().toISOString()
    };
    if (ticket) {
      if (!ticket.messages) ticket.messages = [];
      ticket.messages.push(newMsg);
    }
    return NextResponse.json(newMsg);
  }

  // Products CRUD: /api/v1/products
  if (path === 'products') {
    const priceVal = parseFloat(body.price) || 100000;
    const compareVal = body.compare_price ? parseFloat(body.compare_price) : (priceVal * 1.15);
    const discountPct = compareVal > priceVal ? Math.round(((compareVal - priceVal) / compareVal) * 100) : 0;
    const imgUrl = body.image_url || body.images?.[0] || 'https://images.unsplash.com/photo-1587831990711-23ca6441447b?w=600&q=80';

    const newProd = {
      id: `prod-${Date.now()}`,
      name: body.name || 'Nouveau Produit',
      slug: (body.name || 'produit').toLowerCase().replace(/\s+/g, '-'),
      description: body.description || '',
      short_description: body.short_description || body.description?.slice(0, 100) || '',
      price: priceVal,
      compare_price: compareVal,
      discount_percent: discountPct,
      category_id: body.category_id || categories[0].id,
      category: categories.find(c => c.id === body.category_id || c.name === body.category_id) || categories[0],
      brand: body.brand || 'AM Info',
      stock_quantity: parseInt(body.stock_quantity || body.stock || '10'),
      images: [imgUrl],
      image_url: imgUrl,
      thumbnail: imgUrl,
      is_active: body.is_active !== undefined ? body.is_active : true,
      is_featured: !!body.is_featured,
      rating_avg: 5.0,
      rating_count: 1,
      created_at: new Date().toISOString()
    };
    products.unshift(newProd);
    return NextResponse.json(newProd);
  }

  // Discounts CRUD: /api/v1/admin/discounts or /api/v1/discounts
  if (path === 'admin/discounts' || path === 'discounts') {
    const code = (body.code || body.name || 'PROMO').toUpperCase().replace(/\s+/g, '');
    const newDisc = {
      id: `disc-${Date.now()}`,
      name: body.name || 'Code Promo',
      code: code,
      discount_type: body.discount_type || 'percentage',
      value: parseFloat(body.value) || 10,
      target_type: body.target_type || 'global',
      target_id: body.target_id || null,
      min_order_amount: parseFloat(body.min_order_amount) || 0,
      description: body.description || `${body.value}${body.discount_type === 'percentage' ? '%' : ' Ar'} de remise`,
      is_active: true,
      created_at: new Date().toISOString()
    };
    discounts.unshift(newDisc);
    return NextResponse.json(newDisc);
  }

  // IA Chat: /api/v1/ia/chat
  if (path === 'ia/chat') {
    const userMsg = (body.message || '').toLowerCase();
    let reply = "Bonjour ! Je suis le conseiller technique d'AM Info Madagascar. Comment puis-je vous aider pour votre matériel informatique ou dépannage à Antananarivo ?";
    if (userMsg.includes('panne') || userMsg.includes('dépannage') || userMsg.includes('allume pas') || userMsg.includes('lent') || userMsg.includes('chauffe')) {
      reply = "Pour cette panne, notre atelier AM Info à Analakely peut réaliser un diagnostic complet (dépoussiérage ultrasons, changement de pâte thermique). Vous pouvez ouvrir un ticket SAV dans l'onglet Assistance.";
    } else if (userMsg.includes('conseil') || userMsg.includes('pc') || userMsg.includes('gaming') || userMsg.includes('prix')) {
      reply = "Nous disposons de PC portables, stations gamer sur mesure et composants certifiés en stock à Antananarivo, payables par MVola, Orange Money, Airtel Money ou en boutique avec facturation et garantie.";
    }
    return NextResponse.json({ response: reply, message: reply });
  }

  return NextResponse.json({ message: 'OK', path });
}

export async function PUT(req: NextRequest, { params }: { params: { path: string[] } }) {
  const path = (params.path || []).join('/');
  let body: any = {};
  try {
    const text = await req.text();
    if (text) body = JSON.parse(text);
  } catch {}

  // Settings update: /api/v1/settings
  if (path === 'settings') {
    siteSettings = { ...siteSettings, ...body };
    return NextResponse.json({ message: 'Paramètres mis à jour', settings: siteSettings });
  }

  // Update Cart Item: /api/v1/cart/items/:id
  if (path.startsWith('cart/items/')) {
    const itemId = params.path[2];
    const item = cartItems.find(i => i.id === itemId);
    if (item && body.quantity !== undefined) {
      item.quantity = Math.max(1, body.quantity);
    }
    return NextResponse.json(calculateCartTotals());
  }

  // Cancel Order: /api/v1/orders/:id/cancel
  if (path.includes('/cancel')) {
    const orderId = params.path[1];
    const order = orders.find(o => o.id === orderId);
    if (order) order.status = 'cancelled';
    return NextResponse.json({ message: 'Commande annulée', order });
  }

  // Order status update: /api/v1/admin/orders/:id/status
  if (path.includes('/status') && path.startsWith('admin/orders/')) {
    const orderId = params.path[2];
    const order = orders.find(o => o.id === orderId);
    if (order) order.status = body.status || order.status;
    return NextResponse.json({ message: 'Statut mis à jour', order });
  }

  // Product Update: /api/v1/products/:id
  if (path.startsWith('products/') && params.path.length === 2) {
    const prodId = params.path[1];
    const prod = products.find(p => p.id === prodId);
    if (prod) {
      if (body.price !== undefined) prod.price = parseFloat(body.price);
      if (body.compare_price !== undefined) prod.compare_price = parseFloat(body.compare_price);
      if (body.name !== undefined) prod.name = body.name;
      if (body.brand !== undefined) prod.brand = body.brand;
      if (body.description !== undefined) prod.description = body.description;
      if (body.stock_quantity !== undefined) prod.stock_quantity = parseInt(body.stock_quantity);
      if (body.image_url !== undefined) {
        prod.image_url = body.image_url;
        prod.thumbnail = body.image_url;
        prod.images = [body.image_url];
      }
      if (body.category_id !== undefined) {
        prod.category_id = body.category_id;
        prod.category = categories.find(c => c.id === body.category_id || c.name === body.category_id) || prod.category;
      }
      if (body.is_active !== undefined) prod.is_active = body.is_active;
      if (body.is_featured !== undefined) prod.is_featured = body.is_featured;

      if (prod.compare_price && prod.compare_price > prod.price) {
        prod.discount_percent = Math.round(((prod.compare_price - prod.price) / prod.compare_price) * 100);
      } else {
        prod.discount_percent = 0;
      }
    }
    return NextResponse.json({ message: 'Produit mis à jour', product: prod });
  }

  // Technician ticket status: /api/v1/technician/tickets/:id/status
  if (path.includes('/status') && path.startsWith('technician/tickets/')) {
    const tktId = params.path[2];
    const ticket = tickets.find(t => t.id === tktId);
    if (ticket) ticket.status = body.status || ticket.status;
    return NextResponse.json({ message: 'Statut ticket mis à jour', ticket });
  }

  return NextResponse.json({ message: 'OK', path });
}

export async function PATCH(req: NextRequest, { params }: { params: { path: string[] } }) {
  const path = (params.path || []).join('/');
  let body: any = {};
  try {
    const text = await req.text();
    if (text) body = JSON.parse(text);
  } catch {}

  // Toggle discount: /api/v1/admin/discounts/:id/toggle
  if (path.includes('/toggle')) {
    const discId = params.path[2];
    const disc = discounts.find(d => d.id === discId);
    if (disc) disc.is_active = !disc.is_active;
    return NextResponse.json({ message: 'Remise modifiée', discount: disc });
  }

  // Stock update: /api/v1/products/:id/stock
  if (path.includes('/stock')) {
    const prodId = params.path[1];
    const prod = products.find(p => p.id === prodId);
    if (prod && body.stock !== undefined) prod.stock_quantity = body.stock;
    return NextResponse.json({ message: 'Stock mis à jour', product: prod });
  }

  return NextResponse.json({ message: 'OK' });
}

export async function DELETE(req: NextRequest, { params }: { params: { path: string[] } }) {
  const path = (params.path || []).join('/');

  // Clear cart: /api/v1/cart
  if (path === 'cart') {
    cartItems = [];
    appliedCoupon = null;
    return NextResponse.json({ message: 'Panier vidé', ...calculateCartTotals() });
  }

  // Remove cart item: /api/v1/cart/items/:id
  if (path.startsWith('cart/items/')) {
    const itemId = params.path[2];
    cartItems = cartItems.filter(i => i.id !== itemId);
    return NextResponse.json({ message: 'Article retiré', ...calculateCartTotals() });
  }

  // Delete product: /api/v1/products/:id
  if (path.startsWith('products/')) {
    const prodId = params.path[1];
    products = products.filter(p => p.id !== prodId);
    return NextResponse.json({ message: 'Produit supprimé' });
  }

  // Delete discount: /api/v1/admin/discounts/:id
  if (path.startsWith('admin/discounts/')) {
    const discId = params.path[2];
    discounts = discounts.filter(d => d.id !== discId);
    return NextResponse.json({ message: 'Remise supprimée' });
  }

  // Delete account: /api/v1/auth/account
  if (path === 'auth/account') {
    return NextResponse.json({ message: 'Compte supprimé avec succès' });
  }

  return NextResponse.json({ message: 'Supprimé' });
}

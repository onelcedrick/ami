import { NextRequest, NextResponse } from 'next/server';

const mockProducts = [
  { id: 'prod-1', name: 'PC Portable Pro Stealth 15" Core i7', category: 'PC Portables', price: 1399.99, image_url: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=200&q=80' },
  { id: 'prod-2', name: 'Station Gaming Ryzen 7 RTX 4070 Ti', category: 'PC Fixes & Gaming', price: 1899.00, image_url: 'https://images.unsplash.com/photo-1587831990711-23ca6441447b?w=200&q=80' },
  { id: 'prod-3', name: 'Carte Graphique GeForce RTX 4060 8GB', category: 'Composants', price: 329.90, image_url: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=200&q=80' },
  { id: 'prod-4', name: 'Écran Incurvé 27" QHD 165Hz IPS', category: 'Périphériques', price: 279.00, image_url: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=200&q=80' },
  { id: 'prod-5', name: 'SSD NVMe PCIe 4.0 2 To', category: 'Composants', price: 149.99, image_url: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=200&q=80' },
  { id: 'prod-6', name: 'Pack Clavier Mécanique + Souris 8K', category: 'Périphériques', price: 119.00, image_url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=200&q=80' },
  { id: 'prod-7', name: 'Forfait Maintenance Intégrale Atelier', category: 'Services SAV', price: 69.00, image_url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=200&q=80' },
  { id: 'prod-8', name: 'Routeur Wi-Fi 6 Mesh AX6000 Pro', category: 'Réseau', price: 189.90, image_url: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=200&q=80' },
];

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q') || '';
  if (!q || q.length < 2) {
    return NextResponse.json({ data: [] });
  }
  const qLower = q.toLowerCase();
  const results = mockProducts.filter(p => p.name.toLowerCase().includes(qLower) || p.category.toLowerCase().includes(qLower));
  return NextResponse.json({ data: results });
}

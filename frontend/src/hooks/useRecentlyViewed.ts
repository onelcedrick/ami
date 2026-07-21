// -*- coding: utf-8 -*-
const MAX_ITEMS = 8;

interface RecentProduct {
  id: string;
  name: string;
  price: number;
  image_url?: string;
  category?: string;
}

export function addRecentlyViewed(product: RecentProduct) {
  const viewed: RecentProduct[] = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
  const filtered = viewed.filter(p => p.id !== product.id);
  filtered.unshift({
    id: product.id,
    name: product.name,
    price: product.price,
    image_url: product.image_url,
    category: product.category
  });
  if (filtered.length > MAX_ITEMS) filtered.pop();
  localStorage.setItem('recentlyViewed', JSON.stringify(filtered));
}

export function getRecentlyViewed(): RecentProduct[] {
  return JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
}

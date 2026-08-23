import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/src/lib/seo';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/products`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/compare`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/map`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/login`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${SITE_URL}/register`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
  ];

  let productPages: MetadataRoute.Sitemap = [];
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (apiUrl) {
      const res = await fetch(`${apiUrl}/api/v1/products?limit=100`, { next: { revalidate: 3600 } });
      if (res.ok) {
        const data = await res.json();
        const products = data.data || data.products || [];
        productPages = products.map((p: { id: string; updated_at?: string }) => ({
          url: `${SITE_URL}/products/${p.id}`,
          lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
          changeFrequency: 'weekly' as const,
          priority: 0.7,
        }));
      }
    }
  } catch {
    // API unavailable at build time — static pages only
  }

  return [...staticPages, ...productPages];
}

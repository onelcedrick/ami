import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/src/lib/seo';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/products', '/products/*'],
        disallow: ['/admin/', '/technician/', '/cart', '/orders', '/profile', '/api/'],
      },
      {
        userAgent: ['GPTBot', 'ChatGPT-User', 'Google-Extended', 'ClaudeBot', 'PerplexityBot'],
        allow: ['/', '/products', '/products/*', '/llms.txt', '/llms-full.txt'],
        disallow: ['/admin/', '/technician/', '/cart', '/orders', '/profile'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}

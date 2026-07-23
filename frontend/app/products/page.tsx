import type { Metadata } from 'next';
import ProductListPage from '@/src/pages/client/ProductListPage';
import { SITE_NAME, SITE_URL } from '@/src/lib/seo';

export const metadata: Metadata = {
  title: 'Catalogue Produits Informatiques',
  description: `Découvrez notre catalogue de matériel informatique — PC, périphériques, composants et accessoires. ${SITE_NAME}, votre expert en assistance et maintenance informatique.`,
  openGraph: {
    title: `Catalogue Produits | ${SITE_NAME}`,
    description: 'Matériel informatique, périphériques et accessoires avec livraison en France.',
    url: `${SITE_URL}/products`,
  },
  alternates: { canonical: `${SITE_URL}/products` },
};

export default function Page() {
  return <ProductListPage />;
}

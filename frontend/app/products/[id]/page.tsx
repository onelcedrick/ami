import type { Metadata } from 'next';
import ProductDetailPage from '@/src/pages/client/ProductDetailPage';
import { SITE_NAME, SITE_URL } from '@/src/lib/seo';

type Props = { params: { id: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const title = `Produit #${params.id}`;
  const description = `Consultez les détails et caractéristiques de nos équipements informatiques chez ${SITE_NAME}.`;

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (apiUrl) {
      const res = await fetch(`${apiUrl}/api/v1/products/${params.id}`, { next: { revalidate: 300 } });
      if (res.ok) {
        const product = await res.json();
        const prodTitle = product.name || title;
        const prodDesc = product.description || description;
        return {
          title: prodTitle,
          description: prodDesc,
          openGraph: {
            title: prodTitle,
            description: prodDesc,
            type: 'website',
            url: `${SITE_URL}/products/${params.id}`,
            images: product.image_url ? [{ url: product.image_url, alt: product.name }] : [],
          },
          alternates: { canonical: `${SITE_URL}/products/${params.id}` },
        };
      }
    }
  } catch {
    // Fallback quietly if network is not available during static generation
  }

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      url: `${SITE_URL}/products/${params.id}`,
    },
    alternates: { canonical: `${SITE_URL}/products/${params.id}` },
  };
}

export default function Page() {
  return <ProductDetailPage />;
}

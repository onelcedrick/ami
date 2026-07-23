import type { Metadata } from 'next';
import ProductDetailPage from '@/src/pages/client/ProductDetailPage';
import { SITE_NAME, SITE_URL } from '@/src/lib/seo';

type Props = { params: { id: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    const res = await fetch(`${apiUrl}/api/v1/products/${params.id}`, { next: { revalidate: 300 } });
    if (!res.ok) return { title: 'Produit' };
    const product = await res.json();
    const title = product.name || 'Produit';
    const description =
      product.description ||
      `${product.name} — Achetez chez ${SITE_NAME}, expert en matériel informatique et assistance technique.`;
    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: 'website',
        url: `${SITE_URL}/products/${params.id}`,
        images: product.image_url ? [{ url: product.image_url, alt: product.name }] : [],
      },
      alternates: { canonical: `${SITE_URL}/products/${params.id}` },
    };
  } catch {
    return { title: 'Produit' };
  }
}

export default function Page() {
  return <ProductDetailPage />;
}

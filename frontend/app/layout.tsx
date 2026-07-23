import type { Metadata } from 'next';
import './globals.css';
import RootClientLayout from '@/src/layouts/RootLayout';
import JsonLd from '@/src/components/JsonLd';
import {
  SITE_NAME,
  SITE_DESCRIPTION,
  SITE_KEYWORDS,
  SITE_URL,
  defaultOpenGraph,
  organizationJsonLd,
  websiteJsonLd,
  localBusinessJsonLd,
  faqJsonLd,
} from '@/src/lib/seo';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Assistance & Maintenance Informatique`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: SITE_KEYWORDS,
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  openGraph: {
    ...defaultOpenGraph,
    url: SITE_URL,
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} — Assistance & Maintenance Informatique`,
    description: SITE_DESCRIPTION,
  },
  alternates: {
    canonical: SITE_URL,
    languages: { 'fr-FR': SITE_URL },
  },
  category: 'technology',
};

const homeFaqs = [
  {
    question: 'Quels services propose AM Info ?',
    answer:
      'AM Info propose la vente de matériel informatique, le dépannage technique, la maintenance informatique et un support SAV disponible 24/7.',
  },
  {
    question: 'Comment contacter le support technique ?',
    answer:
      'Créez un compte client et ouvrez un ticket de support depuis votre espace personnel. Un technicien vous répondra rapidement.',
  },
  {
    question: 'AM Info livre-t-il partout en France ?',
    answer:
      'Oui, AM Info livre du matériel informatique partout en France avec un suivi de commande en temps réel.',
  },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <JsonLd data={[organizationJsonLd(), websiteJsonLd(), localBusinessJsonLd(), faqJsonLd(homeFaqs)]} />
      </head>
      <body>
        <RootClientLayout>{children}</RootClientLayout>
      </body>
    </html>
  );
}

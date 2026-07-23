export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://am-info.fr';
export const SITE_NAME = 'AM Info';
export const SITE_DESCRIPTION =
  'AM Info — Expert en assistance et maintenance informatique. Vente de matériel informatique, dépannage technique, support SAV 24/7 et recommandations IA personnalisées.';
export const SITE_KEYWORDS = [
  'assistance informatique',
  'maintenance informatique',
  'matériel informatique',
  'dépannage PC',
  'support technique',
  'e-commerce informatique',
  'SAV informatique',
  'AM Info',
];

export const defaultOpenGraph = {
  type: 'website' as const,
  locale: 'fr_FR',
  siteName: SITE_NAME,
  title: `${SITE_NAME} — Assistance & Maintenance Informatique`,
  description: SITE_DESCRIPTION,
};

export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/icon.svg`,
    description: SITE_DESCRIPTION,
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      availableLanguage: ['French'],
      areaServed: 'FR',
    },
    sameAs: [],
  };
}

export function websiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    inLanguage: 'fr-FR',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/products?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function productJsonLd(product: {
  id: string;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  category?: { name?: string };
  stock?: number;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description || `${product.name} — disponible chez ${SITE_NAME}`,
    image: product.image_url || `${SITE_URL}/icon.svg`,
    sku: product.id,
    brand: { '@type': 'Brand', name: SITE_NAME },
    category: product.category?.name,
    offers: {
      '@type': 'Offer',
      url: `${SITE_URL}/products/${product.id}`,
      priceCurrency: 'EUR',
      price: product.price,
      availability:
        product.stock && product.stock > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
      seller: { '@type': 'Organization', name: SITE_NAME },
    },
  };
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function localBusinessJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    priceRange: '€€',
    areaServed: { '@type': 'Country', name: 'France' },
    serviceType: [
      'Assistance informatique',
      'Maintenance informatique',
      'Vente de matériel informatique',
      'Support technique SAV',
    ],
  };
}

export function faqJsonLd(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  };
}

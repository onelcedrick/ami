'use client';

import React from 'react';
import Head from 'next/head';
import { SITE_NAME, SITE_URL } from '@/src/lib/seo';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
  geoRegion?: string;
  geoPlacename?: string;
  geoPosition?: string;
  jsonLd?: Record<string, any> | Record<string, any>[];
}

export const SEO: React.FC<SEOProps> = ({
  title,
  description = 'AM Info — Expert en assistance, dépannage et maintenance informatique. Vente de matériel, diagnostic rapide et support technique.',
  image = `${SITE_URL}/icon.svg`,
  url = SITE_URL,
  type = 'website',
  geoRegion = 'FR-75',
  geoPlacename = 'Paris, France',
  geoPosition = '48.8566;2.3522',
  jsonLd,
}) => {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} — Assistance & Maintenance Informatique`;

  return (
    <>
      {/* Dynamic metadata for SEO & GEO */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      
      {/* OpenGraph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content={SITE_NAME} />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Geolocation Meta Tags */}
      <meta name="geo.region" content={geoRegion} />
      <meta name="geo.placename" content={geoPlacename} />
      <meta name="geo.position" content={geoPosition} />
      <meta name="ICBM" content={geoPosition.replace(';', ', ')} />

      {/* Structured Data JSON-LD */}
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(Array.isArray(jsonLd) ? jsonLd : jsonLd),
          }}
        />
      )}
    </>
  );
};

export default SEO;

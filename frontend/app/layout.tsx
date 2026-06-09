import type { Metadata } from 'next';
import './globals.css';
import RootLayoutClient from '@/src/layouts/RootLayout';

export const metadata: Metadata = {
  title: 'AM Info - E-Commerce',
  description: 'Plateforme e-commerce avec IA',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <RootLayoutClient>
          {children}
        </RootLayoutClient>
      </body>
    </html>
  );
}

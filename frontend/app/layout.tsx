import type { Metadata } from 'next';
import './globals.css';
import RootClientLayout from '@/src/layouts/RootLayout';

export const metadata: Metadata = {
  title: 'AM Info - E-Commerce',
  description: 'Plateforme e-commerce avec IA - Assistance & Maintenance Informatique',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <RootClientLayout>{children}</RootClientLayout>
      </body>
    </html>
  );
}

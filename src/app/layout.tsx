import type { ReactNode } from 'react';
import './globals.css';

export const metadata = {
  title: 'YIRA Emploi',
  description: 'Plateforme nationale d\'insertion professionnelle des jeunes - Côte d\'Ivoire',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
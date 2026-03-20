import type { ReactNode } from 'react';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';

export const metadata = {
  title: 'YIRA Emploi',
  description: 'Plateforme nationale d\'insertion professionnelle des jeunes - Côte d\'Ivoire',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}

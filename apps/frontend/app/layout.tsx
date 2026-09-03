import type { Metadata } from 'next';
import { GeistMono } from 'geist/font/mono';
import './globals.css';
import { cn } from '@/lib/utils';
import { marianne, spectral } from '@/lib/fonts';

export const metadata: Metadata = {
  title: 'CartePro',
  description: "Dispositif d'avantages salariés dématérialisés",
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="fr"
      suppressHydrationWarning
      className={cn(
        'h-full',
        'antialiased',
        spectral.variable,
        marianne.variable,
        GeistMono.variable,
      )}
    >
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}

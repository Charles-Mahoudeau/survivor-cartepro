import type { Metadata } from 'next';
import { GeistMono } from 'geist/font/mono';
import { GeistSans } from 'geist/font/sans';

import './globals.css';
import { SkipLink } from '@/components/composites/skip-link';
import { Toaster } from '@/components/ui/sonner';
import { SITE_CONTENT } from '@/content/site';

export const metadata: Metadata = {
  title: SITE_CONTENT.title,
  description: SITE_CONTENT.description,
};

/**
 * The root holds no chrome of its own: a space frames itself with its sidebar,
 * a public page with its own column. A footer here would sit outside the
 * sidebar shell, below its full-viewport height, and never be seen.
 */
export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="fr" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="flex min-h-svh flex-col">
        <SkipLink />
        {children}
        <Toaster />
      </body>
    </html>
  );
}

import type { Metadata } from 'next';
import { GeistMono } from 'geist/font/mono';
import { GeistSans } from 'geist/font/sans';

import './globals.css';
import { SiteFooter } from '@/components/composites/site-footer';
import { SkipLink } from '@/components/composites/skip-link';
import { Toaster } from '@/components/ui/sonner';
import { SITE_CONTENT } from '@/content/site';

export const metadata: Metadata = {
  title: SITE_CONTENT.title,
  description: SITE_CONTENT.description,
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="fr" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="flex min-h-screen flex-col">
        <SkipLink />
        <div className="flex flex-1 flex-col">{children}</div>
        <SiteFooter />
        <Toaster />
      </body>
    </html>
  );
}

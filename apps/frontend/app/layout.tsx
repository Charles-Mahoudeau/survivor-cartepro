import type { Metadata, Viewport } from 'next';
import { GeistMono } from 'geist/font/mono';
import { GeistSans } from 'geist/font/sans';

import './globals.css';
import { ServiceWorkerRegistration } from '@/components/composites/service-worker.client';
import { SkipLink } from '@/components/composites/skip-link';
import { Toaster } from '@/components/ui/sonner';
import { PWA_THEME_COLOR } from '@/constants/pwa';
import { SITE_CONTENT } from '@/content/site';

export const metadata: Metadata = {
  title: SITE_CONTENT.title,
  description: SITE_CONTENT.description,
  applicationName: SITE_CONTENT.brand,
  appleWebApp: {
    capable: true,
    title: SITE_CONTENT.brand,
    statusBarStyle: 'default',
  },
};

/**
 * No `maximumScale` and no `userScalable`: blocking zoom would fail the
 * accessibility gate, in the installed app as much as in a tab.
 */
export const viewport: Viewport = {
  themeColor: PWA_THEME_COLOR,
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
        <ServiceWorkerRegistration />
        <SkipLink />
        {children}
        <Toaster />
      </body>
    </html>
  );
}

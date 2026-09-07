import { Footer } from '@codegouvfr/react-dsfr/Footer';
import { SkipLinks } from '@codegouvfr/react-dsfr/SkipLinks';
import type { Metadata } from 'next';
import { GeistMono } from 'geist/font/mono';

import './globals.css';
import { Toaster } from '@/components/ui/sonner';
import { SITE_CONTENT } from '@/content/site';
import { DsfrProvider } from '@/lib/dsfr';
import { DsfrHead, getHtmlAttributes } from '@/lib/dsfr/server-only-index';

export const metadata: Metadata = {
  title: SITE_CONTENT.title,
  description: SITE_CONTENT.description,
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html {...getHtmlAttributes({ lang: 'fr' })} className={GeistMono.variable}>
      <head>
        <DsfrHead
          preloadFonts={[
            'Marianne-Regular',
            'Marianne-Medium',
            'Marianne-Bold',
          ]}
        />
      </head>
      <body className="flex min-h-screen flex-col">
        <DsfrProvider lang="fr">
          <SkipLinks
            links={[{ label: SITE_CONTENT.skipToContent, anchor: '#contenu' }]}
          />
          <div className="flex flex-1 flex-col">{children}</div>
          <Footer
            brandTop={SITE_CONTENT.brandTop}
            homeLinkProps={{ href: '/', title: SITE_CONTENT.homeTitle }}
            accessibility="non compliant"
            contentDescription={SITE_CONTENT.footerDescription}
            bottomItems={[
              { text: SITE_CONTENT.footerSimulation, linkProps: { href: '/' } },
            ]}
          />
          <Toaster />
        </DsfrProvider>
      </body>
    </html>
  );
}

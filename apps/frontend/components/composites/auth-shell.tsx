import type { ReactNode } from 'react';

import { BandeauSimulation } from './simulation-banner';
import { SiteHeader } from './site-header.client';

export function AuthShell({
  titre,
  sousTitre,
  children,
}: {
  titre: string;
  sousTitre: string;
  children: ReactNode;
}) {
  return (
    <>
      <SiteHeader />
      <BandeauSimulation />

      <main id="contenu" className="fr-container fr-py-6w flex flex-1">
        <div className="fr-grid-row fr-grid-row--center w-full">
          <div className="fr-col-12 fr-col-sm-8 fr-col-md-6 fr-col-lg-5">
            <h1 className="fr-h3 fr-mb-1w">{titre}</h1>
            <p className="fr-text--sm fr-mb-4w text-[color:var(--muted-foreground)]">
              {sousTitre}
            </p>
            {children}
          </div>
        </div>
      </main>
    </>
  );
}

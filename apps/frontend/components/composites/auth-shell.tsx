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

      <main
        id="contenu"
        className="mx-auto flex w-full max-w-5xl flex-1 px-4 py-10"
      >
        <div className="mx-auto w-full max-w-md">
          <h1 className="font-display text-2xl font-bold tracking-tight">
            {titre}
          </h1>
          <p className="mb-8 text-sm text-muted-foreground">{sousTitre}</p>
          {children}
        </div>
      </main>
    </>
  );
}

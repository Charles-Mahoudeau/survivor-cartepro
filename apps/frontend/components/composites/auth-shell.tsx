import type { ReactNode } from 'react';

import { Card } from '@/components/composites/card';
import { SITE_CONTENT } from '@/content/site';

/**
 * One column, one focal point: the card. Nothing else on the screen competes
 * with it, so the eye lands on the form rather than on the chrome.
 */
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
    <main
      id="contenu"
      className="mx-auto flex w-full max-w-[26rem] flex-1 flex-col justify-center gap-8 px-4 py-12"
    >
      <p className="text-center text-lg font-semibold tracking-tight">
        {SITE_CONTENT.brand}
      </p>

      <Card className="p-6 md:p-8">
        <h1 className="text-xl font-semibold tracking-tight">{titre}</h1>
        <p className="text-muted-foreground mt-1 mb-8 text-sm">{sousTitre}</p>
        {children}
      </Card>

      <p className="text-muted-foreground text-center text-xs">
        {SITE_CONTENT.simulation.description}
      </p>
    </main>
  );
}

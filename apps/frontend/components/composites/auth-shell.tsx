import type { ReactNode } from 'react';

import { Card } from '@/components/composites/card';
import { SITE_CONTENT } from '@/content/site';

/**
 * One column, one focal point: the card. The product name is already in the
 * heading of the card, so nothing above it repeats it.
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
      className="mx-auto flex w-full max-w-[26rem] flex-1 flex-col justify-center gap-6 px-4 py-12"
    >
      <Card className="p-6 md:p-8">
        <h1 className="text-xl font-semibold tracking-tight">{titre}</h1>
        <p className="text-muted-foreground mt-1 mb-8 text-sm">{sousTitre}</p>
        {children}
      </Card>

      <p className="text-muted-foreground text-center text-xs">
        {SITE_CONTENT.simulation.description}
      </p>

      <p className="text-muted-foreground mt-auto pt-8 text-center text-xs">
        {SITE_CONTENT.disclaimer}
      </p>
    </main>
  );
}

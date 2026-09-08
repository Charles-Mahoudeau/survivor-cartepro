import { RiInformationLine } from '@remixicon/react';

import { SITE_CONTENT } from '@/content/site';

/** The legal mention of simulation, spanning the whole content column. */
export function BandeauSimulation() {
  return (
    <div className="bg-muted/60 text-muted-foreground flex w-full items-start gap-2 rounded-xl px-4 py-3 text-xs">
      <RiInformationLine aria-hidden className="mt-px size-4 shrink-0" />
      <p>
        <span className="text-foreground font-medium">
          {SITE_CONTENT.simulation.title}
        </span>{' '}
        {SITE_CONTENT.simulation.description}
      </p>
    </div>
  );
}

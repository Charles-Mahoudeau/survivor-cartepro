import { Notice } from '@codegouvfr/react-dsfr/Notice';

import { SITE_CONTENT } from '@/content/site';

/** The legal mention of simulation, the first of its nine placements. */
export function BandeauSimulation() {
  return (
    <Notice
      severity="info"
      title={SITE_CONTENT.simulation.title}
      description={SITE_CONTENT.simulation.description}
    />
  );
}

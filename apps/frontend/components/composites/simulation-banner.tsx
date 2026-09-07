import { Alert } from '@/components/ui/alert';
import { SITE_CONTENT } from '@/content/site';

/** The legal mention of simulation, the first of its nine placements. */
export function BandeauSimulation() {
  return (
    <div className="border-b border-border bg-background">
      <div className="mx-auto w-full max-w-5xl px-4 py-3">
        <Alert
          severity="info"
          title={SITE_CONTENT.simulation.title}
          description={SITE_CONTENT.simulation.description}
        />
      </div>
    </div>
  );
}

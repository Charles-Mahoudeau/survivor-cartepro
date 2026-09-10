import { Card } from '@/components/composites/card';

const pulse = 'animate-pulse rounded bg-muted';

/** Stands in for the dossier while it loads. */
export function DossierSkeleton() {
  return (
    <div aria-busy="true">
      {Array.from({ length: 3 }, (_, index) => (
        <Card key={index} className="mb-4 p-5">
          <div className={`mb-3 h-4 w-40 ${pulse}`} />
          <div className={`mb-2 h-3 w-full ${pulse}`} />
          <div className={`h-3 w-2/3 ${pulse}`} />
        </Card>
      ))}
    </div>
  );
}

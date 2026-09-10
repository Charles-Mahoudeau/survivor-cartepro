import { Card } from '@/components/composites/card';

const pulse = 'animate-pulse rounded bg-muted';

/** Stands in for the catalogue while its first page loads. */
export function CatalogueSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div aria-busy="true">
      <div className={`mb-4 h-10 rounded-xl ${pulse}`} />
      <div className="mb-6 flex gap-2">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className={`h-8 w-24 rounded-full ${pulse}`} />
        ))}
      </div>
      <Card className="p-2">
        {Array.from({ length: rows }, (_, index) => (
          <div key={index} className="px-3 py-3">
            <div className={`mb-1.5 h-3 w-40 ${pulse}`} />
            <div className={`h-2.5 w-56 ${pulse}`} />
          </div>
        ))}
      </Card>
    </div>
  );
}

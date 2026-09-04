import { Card } from '@/components/composites/card';

const pulse = 'animate-pulse rounded bg-[color:var(--muted)]';

export function PartnersSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div aria-busy="true">
      <div className={`mb-3 h-10 ${pulse}`} />
      <div className="mb-5 flex gap-2">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className={`h-7 w-20 rounded-full ${pulse}`} />
        ))}
      </div>
      <div className="space-y-2">
        {Array.from({ length: rows }, (_, i) => (
          <Card key={i} className="p-4">
            <div className="flex items-start gap-3">
              <div className={`h-10 w-10 ${pulse}`} />
              <div className="flex-1">
                <div className={`mb-1.5 h-3 w-40 ${pulse}`} />
                <div className={`h-2.5 w-56 ${pulse}`} />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

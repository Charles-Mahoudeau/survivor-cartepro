import { Card } from '@/components/composites/card';

const pulse = 'animate-pulse rounded bg-muted';

export function BalanceSkeleton() {
  return (
    <Card className="p-6 md:p-8" aria-busy="true">
      <div className={`mb-3 h-3 w-28 ${pulse}`} />
      <div className={`mb-3 h-10 w-52 ${pulse}`} />
      <div className={`h-3 w-40 ${pulse}`} />
    </Card>
  );
}

export function MovementsSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <Card className="p-2" aria-busy="true">
      {Array.from({ length: rows }, (_, index) => (
        <div
          key={index}
          className="flex items-center justify-between px-3 py-3"
        >
          <div className="flex items-center gap-3">
            <div className={`size-9 rounded-full ${pulse}`} />
            <div>
              <div className={`mb-1.5 h-3 w-32 ${pulse}`} />
              <div className={`h-2.5 w-20 ${pulse}`} />
            </div>
          </div>
          <div className={`h-3 w-16 ${pulse}`} />
        </div>
      ))}
    </Card>
  );
}

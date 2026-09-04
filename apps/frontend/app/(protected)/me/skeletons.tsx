import { Card } from '@/components/composites/card';

const pulse = 'animate-pulse rounded bg-[color:var(--muted)]';

export function BalanceSkeleton() {
  return (
    <Card className="relative mb-4 overflow-hidden p-6 md:p-8" aria-busy="true">
      <div className="pl-4">
        <div className={`mb-3 h-3 w-28 ${pulse}`} />
        <div className={`mb-3 h-10 w-52 ${pulse}`} />
        <div className={`h-3 w-40 ${pulse}`} />
      </div>
    </Card>
  );
}

export function MovementsSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <Card aria-busy="true">
      {Array.from({ length: rows }, (_, i) => (
        <div
          key={i}
          className={`flex items-center justify-between px-4 py-3.5 ${
            i < rows - 1 ? 'border-b border-[color:var(--border)]' : ''
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`h-8 w-8 rounded-full ${pulse}`} />
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

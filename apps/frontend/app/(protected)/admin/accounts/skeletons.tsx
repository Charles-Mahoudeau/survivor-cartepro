import { Card } from '@/components/composites/card';

const pulse = 'animate-pulse rounded bg-muted';

/** Stands in for the account list while it loads. */
export function AccountsSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div aria-busy="true">
      <div className={`mb-4 h-9 rounded-lg ${pulse}`} />
      <div className="mb-4 flex gap-2">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className={`h-8 w-24 rounded-full ${pulse}`} />
        ))}
      </div>
      <Card className="divide-border divide-y p-0">
        {Array.from({ length: rows }, (_, index) => (
          <div
            key={index}
            className="flex items-center justify-between px-4 py-3"
          >
            <div>
              <div className={`mb-1.5 h-3.5 w-40 ${pulse}`} />
              <div className={`h-2.5 w-56 ${pulse}`} />
            </div>
            <div className={`h-8 w-20 rounded-full ${pulse}`} />
          </div>
        ))}
      </Card>
    </div>
  );
}

/** Stands in for one account while it loads. */
export function AccountSkeleton() {
  return (
    <div aria-busy="true">
      <div className={`mb-2 h-7 w-56 ${pulse}`} />
      <div className={`mb-5 h-4 w-40 ${pulse}`} />
      <Card className="mb-4 p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index}>
              <div className={`mb-1 h-2.5 w-16 ${pulse}`} />
              <div className={`h-4 w-32 ${pulse}`} />
            </div>
          ))}
        </div>
      </Card>
      <Card className="h-48 p-5">
        <div className={`h-4 w-40 ${pulse}`} />
      </Card>
    </div>
  );
}

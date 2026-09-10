import { Card } from '@/components/composites/card';

const pulse = 'animate-pulse rounded bg-muted';

export function AllocationsSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
      <Card className="divide-border divide-y p-0" aria-busy="true">
        {Array.from({ length: rows }, (_, index) => (
          <div
            key={index}
            className="flex items-center justify-between px-4 py-4"
          >
            <div>
              <div className={`mb-2 h-3.5 w-40 ${pulse}`} />
              <div className={`h-2.5 w-56 ${pulse}`} />
            </div>
            <div className={`h-8 w-20 rounded-full ${pulse}`} />
          </div>
        ))}
      </Card>
      <Card className="h-fit p-5" aria-busy="true">
        <div className={`mb-4 h-4 w-36 ${pulse}`} />
        <div className={`mb-3 h-9 w-full ${pulse}`} />
        <div className={`mb-3 h-9 w-full ${pulse}`} />
        <div className={`h-9 w-full ${pulse}`} />
      </Card>
    </div>
  );
}

export function AllocationSkeleton() {
  return (
    <>
      <div className={`mb-2 h-7 w-56 ${pulse}`} />
      <div className={`mb-5 h-3 w-40 ${pulse}`} />
      <Card className="mb-4 p-5" aria-busy="true">
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index}>
              <div className={`mb-1.5 h-2.5 w-24 ${pulse}`} />
              <div className={`h-3.5 w-32 ${pulse}`} />
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}

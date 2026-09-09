import { Card } from '@/components/composites/card';

const pulse = 'animate-pulse rounded bg-muted';

export function QueueSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <Card className="divide-border divide-y p-0" aria-busy="true">
      {Array.from({ length: rows }, (_, index) => (
        <div
          key={index}
          className="flex items-center justify-between px-4 py-4"
        >
          <div>
            <div className={`mb-2 h-3.5 w-44 ${pulse}`} />
            <div className={`h-2.5 w-64 ${pulse}`} />
          </div>
          <div className={`h-8 w-24 rounded-full ${pulse}`} />
        </div>
      ))}
    </Card>
  );
}

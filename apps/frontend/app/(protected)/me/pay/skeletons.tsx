import { Card } from '@/components/composites/card';

const pulse = 'animate-pulse rounded bg-muted';

export function PaySkeleton() {
  return (
    <Card className="flex flex-col items-center p-6 md:p-8" aria-busy="true">
      <div className={`mb-4 size-52 rounded-xl ${pulse}`} />
      <div className={`mb-2 h-3 w-32 ${pulse}`} />
      <div className={`mb-4 h-8 w-48 ${pulse}`} />
      <div className={`h-9 w-44 ${pulse}`} />
    </Card>
  );
}

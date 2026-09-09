import { Card } from '@/components/composites/card';

const pulse = 'animate-pulse rounded bg-muted';

export function DossierSkeleton() {
  return (
    <>
      <div className={`mb-2 h-7 w-64 ${pulse}`} />
      <div className={`mb-5 h-3 w-40 ${pulse}`} />
      <Card className="mb-4 p-5" aria-busy="true">
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index}>
              <div className={`mb-1.5 h-2.5 w-24 ${pulse}`} />
              <div className={`h-3.5 w-44 ${pulse}`} />
            </div>
          ))}
        </div>
      </Card>
      <Card className="p-5" aria-busy="true">
        <div className={`mb-3 h-4 w-28 ${pulse}`} />
        <div className={`h-24 w-full ${pulse}`} />
      </Card>
    </>
  );
}

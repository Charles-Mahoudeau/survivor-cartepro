import { Suspense } from 'react';

import { Card } from '@/components/composites/card';
import { getCurrentUser } from '@/lib/auth/session';

const ROWS = ['Compte', 'Adresse', 'Rôle'] as const;
const pulse = 'animate-pulse rounded bg-muted';

/** Waiting screen of a space whose pages are not built yet. */
export function EspacePlaceholder() {
  return (
    <section className="col-span-12 lg:col-span-8">
      <p className="text-muted-foreground mb-2 px-3 text-xs font-medium">
        Session ouverte. Les écrans de cet espace restent à construire.
      </p>
      <Suspense fallback={<CompteSkeleton />}>
        <CompteCard />
      </Suspense>
    </section>
  );
}

function CompteSkeleton() {
  return (
    <Card className="p-6" aria-busy="true">
      <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-3">
        {ROWS.map((row) => (
          <div key={row} className="contents">
            <dt className="text-muted-foreground text-xs font-medium">{row}</dt>
            <dd className={`h-4 w-40 ${pulse}`} />
          </div>
        ))}
      </dl>
    </Card>
  );
}

async function CompteCard() {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  const values = [user.name, user.email, user.role];

  return (
    <Card className="p-6">
      <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-3">
        {ROWS.map((row, index) => (
          <div key={row} className="contents">
            <dt className="text-muted-foreground text-xs font-medium">{row}</dt>
            <dd className={index === 1 ? 'font-mono-data text-sm' : 'text-sm'}>
              {values[index]}
            </dd>
          </div>
        ))}
      </dl>
    </Card>
  );
}

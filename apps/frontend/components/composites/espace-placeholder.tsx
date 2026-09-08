import { Suspense } from 'react';

import { Card } from '@/components/composites/card';
import { PageHeader } from '@/components/composites/page-header';
import { getCurrentUser } from '@/lib/auth/session';

/**
 * Waiting screen of a space whose pages are not built yet. The chrome comes
 * from the layout; only the account details stream, behind their own boundary.
 */
export function EspacePlaceholder({ titre }: { titre: string }) {
  return (
    <div className="page-enter mx-auto w-full max-w-2xl">
      <PageHeader
        title={titre}
        subtitle="Session ouverte. Les écrans de cet espace restent à construire."
      />
      <Suspense fallback={<CompteSkeleton />}>
        <CompteCard />
      </Suspense>
    </div>
  );
}

const ROWS = ['Compte', 'Adresse', 'Rôle'] as const;

function CompteSkeleton() {
  return (
    <Card className="p-6" aria-busy="true">
      <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-3">
        {ROWS.map((row) => (
          <div key={row} className="contents">
            <dt className="font-display text-muted-foreground text-xs font-medium tracking-wider uppercase">
              {row}
            </dt>
            <dd className="bg-muted h-4 w-40 animate-pulse rounded" />
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
            <dt className="font-display text-muted-foreground text-xs font-medium tracking-wider uppercase">
              {row}
            </dt>
            <dd className={index === 1 ? 'font-mono-data text-sm' : 'text-sm'}>
              {values[index]}
            </dd>
          </div>
        ))}
      </dl>
    </Card>
  );
}

import { Suspense } from 'react';

import { Card } from '@/components/composites/card';
import { BandeauSimulation } from '@/components/composites/simulation-banner';
import { SiteHeader } from '@/components/composites/site-header.client';
import { UserQuickAccess } from '@/components/composites/user-quick-access';
import { getCurrentUser } from '@/lib/auth/session';

/**
 * Waiting screen of a space whose pages are not built yet. The chrome is
 * static; the account details stream behind their own boundary.
 */
export function EspacePlaceholder({
  titre,
  home,
}: {
  titre: string;
  home: string;
}) {
  return (
    <>
      <SiteHeader
        home={home}
        account={
          <Suspense fallback={null}>
            <UserQuickAccess home={home} />
          </Suspense>
        }
      />
      <BandeauSimulation />

      <main id="contenu" className="fr-container fr-py-6w flex-1">
        <div className="fr-grid-row fr-grid-row--center">
          <div className="fr-col-12 fr-col-md-8 fr-col-lg-6">
            <h1 className="fr-h3 fr-mb-1w">{titre}</h1>
            <p className="fr-text--sm fr-mb-4w text-[color:var(--muted-foreground)]">
              Session ouverte. Les écrans de cet espace restent à construire.
            </p>
            <Suspense fallback={<CompteSkeleton />}>
              <CompteCard />
            </Suspense>
          </div>
        </div>
      </main>
    </>
  );
}

const ROWS = ['Compte', 'Adresse', 'Rôle'] as const;

function CompteSkeleton() {
  return (
    <Card className="p-6" aria-busy="true">
      <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-3">
        {ROWS.map((row) => (
          <div key={row} className="contents">
            <dt className="font-display text-xs font-medium uppercase tracking-wider text-[color:var(--muted-foreground)]">
              {row}
            </dt>
            <dd className="h-4 w-40 animate-pulse rounded bg-[color:var(--muted)]" />
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
            <dt className="font-display text-xs font-medium uppercase tracking-wider text-[color:var(--muted-foreground)]">
              {row}
            </dt>
            <dd
              className={
                index === 1 ? 'font-mono-data text-sm' : 'font-serif text-sm'
              }
            >
              {values[index]}
            </dd>
          </div>
        ))}
      </dl>
    </Card>
  );
}

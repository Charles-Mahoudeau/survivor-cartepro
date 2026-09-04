import { Button } from '@codegouvfr/react-dsfr/Button';
import { CallOut } from '@codegouvfr/react-dsfr/CallOut';
import type { Metadata } from 'next';
import { Suspense } from 'react';

import { Card } from '@/components/composites/card';
import { DateTexte } from '@/components/composites/date-texte';
import { Montant } from '@/components/composites/montant';
import { MouvementLigne } from '@/components/composites/mouvement-ligne';
import { PageHeader } from '@/components/composites/page-header';
import { ME_CONTENT } from '@/content/me';
import { getMyWalletHook, listMyWalletEntriesHook } from '@/hooks/api';
import { StartDsfrOnHydration } from '@/lib/dsfr';

import { BalanceSkeleton, MovementsSkeleton } from './skeletons';

const RECENT_MOVEMENTS_LIMIT = 4;

export const metadata: Metadata = {
  title: `${ME_CONTENT.wallet.title} — Ticket Tout (simulation)`,
};

export default function Page() {
  const { wallet } = ME_CONTENT;

  return (
    <div className="page-enter">
      <StartDsfrOnHydration />
      <PageHeader title={wallet.title} subtitle={wallet.subtitle} />

      <Suspense fallback={<BalanceSkeleton />}>
        <BalanceCard />
      </Suspense>

      <div className="fr-mb-4w">
        <Button
          priority="secondary"
          iconId="fr-icon-map-pin-2-line"
          linkProps={{ href: '/me/partners' }}
        >
          {wallet.findPartner}
        </Button>
      </div>

      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-sm font-semibold text-[color:var(--foreground)]">
          {wallet.recentMovements}
        </h2>
        <Button
          priority="tertiary no outline"
          size="small"
          iconId="fr-icon-arrow-right-line"
          iconPosition="right"
          linkProps={{ href: '/me/history' }}
        >
          {wallet.seeAll}
        </Button>
      </div>

      <Suspense fallback={<MovementsSkeleton />}>
        <RecentMovements />
      </Suspense>

      <div className="mt-4 rounded border-l-2 border-[color:var(--primary)] bg-[color:var(--secondary)] p-4">
        <p className="font-serif text-xs text-[color:var(--muted-foreground)]">
          <span className="font-display font-semibold text-[color:var(--primary)]">
            {wallet.note}
          </span>{' '}
          {wallet.noteBody}
        </p>
      </div>
    </div>
  );
}

/** Never cached: a stale balance shown in 48px is a functional defect. */
async function BalanceCard() {
  const wallet = await getMyWalletHook();
  const readAt = new Date().toISOString();

  return (
    <CallOut
      title={ME_CONTENT.wallet.balance}
      titleAs="p"
      bodyAs="div"
      className="fr-mb-3w"
    >
      {wallet ? (
        <>
          <p className="fr-mb-1v font-display text-4xl font-bold text-[color:var(--primary)] md:text-5xl">
            <Montant amount={wallet.balance} currency={wallet.currency} />
          </p>
          <p className="fr-text--xs fr-mb-0 text-[color:var(--muted-foreground)]">
            {ME_CONTENT.wallet.updatedAt}{' '}
            <DateTexte iso={readAt} format="jour" /> à{' '}
            <DateTexte iso={readAt} format="heure" />
          </p>
          {wallet.status === 'disabled' ? (
            <p
              role="status"
              className="fr-text--sm fr-mt-2w fr-mb-0 text-[color:var(--warning)]"
            >
              {ME_CONTENT.wallet.disabled}
            </p>
          ) : null}
        </>
      ) : (
        <p className="fr-text--sm fr-mb-0 text-[color:var(--muted-foreground)]">
          {ME_CONTENT.wallet.noWallet}
        </p>
      )}
    </CallOut>
  );
}

async function RecentMovements() {
  const page = await listMyWalletEntriesHook({ limit: RECENT_MOVEMENTS_LIMIT });
  const entries = page?.items ?? [];

  if (entries.length === 0) {
    return (
      <Card className="p-6">
        <p className="font-serif text-sm text-[color:var(--muted-foreground)]">
          {ME_CONTENT.wallet.noMovement}
        </p>
      </Card>
    );
  }

  return (
    <Card>
      <ul>
        {entries.map((entry, index) => (
          <MouvementLigne
            key={entry.id}
            entry={entry}
            last={index === entries.length - 1}
            variant="compact"
          />
        ))}
      </ul>
    </Card>
  );
}

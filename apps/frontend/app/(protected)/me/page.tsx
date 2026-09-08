import { RiHistoryLine, RiStoreLine } from '@remixicon/react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';

import { Card } from '@/components/composites/card';
import { DateTexte } from '@/components/composites/date-texte';
import { Montant } from '@/components/composites/montant';
import { MouvementLigne } from '@/components/composites/mouvement-ligne';
import { Button } from '@/components/ui/button';
import { ME_CONTENT } from '@/content/me';
import { SITE_CONTENT } from '@/content/site';
import { getMyWalletHook, listMyWalletEntriesHook } from '@/hooks/api';

import { BalanceSkeleton, MovementsSkeleton } from './skeletons';

const RECENT_MOVEMENTS_LIMIT = 5;

export const metadata: Metadata = {
  title: `${ME_CONTENT.wallet.title} — ${SITE_CONTENT.title}`,
};

export default function Page() {
  return (
    <>
      <section className="col-span-12 lg:col-span-8">
        <Suspense fallback={<BalanceSkeleton />}>
          <Balance />
        </Suspense>
      </section>

      <section className="col-span-12 lg:col-span-8">
        <h2 className="text-muted-foreground mb-2 px-3 text-xs font-medium">
          {ME_CONTENT.wallet.recentMovements}
        </h2>
        <Suspense fallback={<MovementsSkeleton />}>
          <RecentMovements />
        </Suspense>
      </section>
    </>
  );
}

/** Never cached: a stale balance shown in 48px is a functional defect. */
async function Balance() {
  const wallet = await getMyWalletHook();
  const readAt = new Date().toISOString();

  return (
    <Card className="p-6 md:p-8">
      {wallet ? (
        <>
          <p className="text-4xl font-semibold tracking-tight md:text-5xl">
            <Montant
              amount={wallet.balance}
              currency={wallet.currency}
              mention={false}
            />
          </p>
          <p className="text-muted-foreground mt-1 text-sm">
            {ME_CONTENT.wallet.balance} · {ME_CONTENT.simulation}
          </p>
          <p className="text-muted-foreground mt-1 text-xs">
            {ME_CONTENT.wallet.updatedAt}{' '}
            <DateTexte iso={readAt} format="jour" /> à{' '}
            <DateTexte iso={readAt} format="heure" />
          </p>
          {wallet.status === 'disabled' ? (
            <p role="status" className="text-warning mt-4 text-sm">
              {ME_CONTENT.wallet.disabled}
            </p>
          ) : null}
        </>
      ) : (
        <p className="text-muted-foreground text-sm">
          {ME_CONTENT.wallet.noWallet}
        </p>
      )}

      <div className="mt-6 flex flex-wrap gap-2">
        <Button asChild size="lg">
          <Link href="/me/partners">
            <RiStoreLine data-icon="inline-start" />
            {ME_CONTENT.wallet.findPartner}
          </Link>
        </Button>
        <Button asChild variant="secondary" size="lg">
          <Link href="/me/history">
            <RiHistoryLine data-icon="inline-start" />
            {ME_CONTENT.history.title}
          </Link>
        </Button>
      </div>
    </Card>
  );
}

async function RecentMovements() {
  const page = await listMyWalletEntriesHook({ limit: RECENT_MOVEMENTS_LIMIT });
  const entries = page?.items ?? [];

  if (entries.length === 0) {
    return (
      <Card className="px-3 py-6">
        <p className="text-muted-foreground text-sm">
          {ME_CONTENT.wallet.noMovement}
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-2">
      <ul>
        {entries.map((entry) => (
          <MouvementLigne key={entry.id} entry={entry} variant="compact" />
        ))}
      </ul>
    </Card>
  );
}

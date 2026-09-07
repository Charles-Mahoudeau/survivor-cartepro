import { RiArrowRightLine, RiMapPin2Line } from '@remixicon/react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';

import { Card } from '@/components/composites/card';
import { DateTexte } from '@/components/composites/date-texte';
import { Montant } from '@/components/composites/montant';
import { MouvementLigne } from '@/components/composites/mouvement-ligne';
import { PageHeader } from '@/components/composites/page-header';
import { Button } from '@/components/ui/button';
import { ME_CONTENT } from '@/content/me';
import { SITE_CONTENT } from '@/content/site';
import { getMyWalletHook, listMyWalletEntriesHook } from '@/hooks/api';

import { BalanceSkeleton, MovementsSkeleton } from './skeletons';

const RECENT_MOVEMENTS_LIMIT = 4;

export const metadata: Metadata = {
  title: `${ME_CONTENT.wallet.title} — ${SITE_CONTENT.title}`,
};

export default function Page() {
  const { wallet } = ME_CONTENT;

  return (
    <div className="page-enter">
      <PageHeader title={wallet.title} subtitle={wallet.subtitle} />

      <Suspense fallback={<BalanceSkeleton />}>
        <BalanceCard />
      </Suspense>

      <div className="mb-8">
        <Button asChild variant="outline" size="lg">
          <Link href="/me/partners">
            <RiMapPin2Line data-icon="inline-start" />
            {wallet.findPartner}
          </Link>
        </Button>
      </div>

      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-sm font-semibold text-[color:var(--foreground)]">
          {wallet.recentMovements}
        </h2>
        <Button asChild variant="ghost" size="sm">
          <Link href="/me/history">
            {wallet.seeAll}
            <RiArrowRightLine data-icon="inline-end" />
          </Link>
        </Button>
      </div>

      <Suspense fallback={<MovementsSkeleton />}>
        <RecentMovements />
      </Suspense>

      <div className="mt-4 rounded-[var(--radius-md)] border-l-2 border-[color:var(--primary)] bg-[color:var(--secondary)] p-4">
        <p className="text-xs text-[color:var(--muted-foreground)]">
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
    <Card className="mb-6 border-l-4 border-l-[color:var(--primary)] p-6">
      <p className="text-sm font-medium text-[color:var(--muted-foreground)]">
        {ME_CONTENT.wallet.balance}
      </p>
      {wallet ? (
        <>
          <p className="mt-1 font-display text-4xl font-bold text-[color:var(--primary)] md:text-5xl">
            <Montant amount={wallet.balance} currency={wallet.currency} />
          </p>
          <p className="mt-1 text-xs text-[color:var(--muted-foreground)]">
            {ME_CONTENT.wallet.updatedAt}{' '}
            <DateTexte iso={readAt} format="jour" /> à{' '}
            <DateTexte iso={readAt} format="heure" />
          </p>
          {wallet.status === 'disabled' ? (
            <p
              role="status"
              className="mt-4 text-sm text-[color:var(--warning)]"
            >
              {ME_CONTENT.wallet.disabled}
            </p>
          ) : null}
        </>
      ) : (
        <p className="mt-1 text-sm text-[color:var(--muted-foreground)]">
          {ME_CONTENT.wallet.noWallet}
        </p>
      )}
    </Card>
  );
}

async function RecentMovements() {
  const page = await listMyWalletEntriesHook({ limit: RECENT_MOVEMENTS_LIMIT });
  const entries = page?.items ?? [];

  if (entries.length === 0) {
    return (
      <Card className="p-6">
        <p className="text-sm text-[color:var(--muted-foreground)]">
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

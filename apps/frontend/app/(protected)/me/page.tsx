import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';

import { Card } from '@/components/composites/card';
import { DateTexte } from '@/components/composites/date-texte';
import { Montant } from '@/components/composites/montant';
import { MouvementLigne } from '@/components/composites/mouvement-ligne';
import { PageHeader } from '@/components/composites/page-header';
import { IconMap } from '@/components/icons';
import { ME_CONTENT } from '@/content/me';
import { getMyWalletHook, listMyWalletEntriesHook } from '@/hooks/api';

import { BalanceSkeleton, MovementsSkeleton } from './skeletons';

const RECENT_MOVEMENTS_LIMIT = 4;

export const metadata: Metadata = {
  title: `${ME_CONTENT.wallet.title} — Ticket Tout (simulation)`,
};

export default function Page() {
  const { wallet } = ME_CONTENT;

  return (
    <div className="page-enter">
      <PageHeader title={wallet.title} subtitle={wallet.subtitle} />

      <Suspense fallback={<BalanceSkeleton />}>
        <BalanceCard />
      </Suspense>

      <div className="mb-6 grid grid-cols-1 gap-3">
        <Link
          href="/me/partners"
          className="flex flex-col items-center gap-2 rounded border border-[color:var(--border)] p-4 font-display text-sm font-medium text-[color:var(--foreground)] transition-all hover:border-[color:var(--primary)] hover:text-[color:var(--primary)]"
        >
          <IconMap className="h-6 w-6" />
          {wallet.findPartner}
        </Link>
      </div>

      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-sm font-semibold text-[color:var(--foreground)]">
          {wallet.recentMovements}
        </h2>
        <Link
          href="/me/history"
          className="font-display text-xs text-[color:var(--primary)] hover:underline"
        >
          {wallet.seeAll}
        </Link>
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
    <Card className="relative mb-4 overflow-hidden p-6 md:p-8">
      <div
        className="absolute bottom-0 left-0 top-0 flex w-1 flex-col"
        aria-hidden="true"
      >
        <div className="flex-1 bg-[#002395]" />
        <div className="flex-1 border-y border-[#E8E8E8] bg-white" />
        <div className="flex-1 bg-[#ED2939]" />
      </div>
      <div className="pl-4">
        <div className="mb-2 font-display text-xs font-medium uppercase tracking-wider text-[color:var(--muted-foreground)]">
          {ME_CONTENT.wallet.balance}
        </div>
        {wallet ? (
          <>
            <div className="mb-1 font-display text-4xl font-bold text-[color:var(--primary)] md:text-5xl">
              <Montant amount={wallet.balance} currency={wallet.currency} />
            </div>
            <div className="font-serif text-xs text-[color:var(--muted-foreground)]">
              {ME_CONTENT.wallet.updatedAt}{' '}
              <DateTexte iso={readAt} format="jour" /> à{' '}
              <DateTexte iso={readAt} format="heure" />
            </div>
            {wallet.status === 'disabled' ? (
              <p
                role="status"
                className="mt-3 font-serif text-xs text-[color:var(--warning)]"
              >
                {ME_CONTENT.wallet.disabled}
              </p>
            ) : null}
          </>
        ) : (
          <p className="font-serif text-sm text-[color:var(--muted-foreground)]">
            {ME_CONTENT.wallet.noWallet}
          </p>
        )}
      </div>
    </Card>
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

import type { Metadata } from 'next';
import { Suspense } from 'react';

import { ME_CONTENT } from '@/content/me';
import { SITE_CONTENT } from '@/content/site';
import { listMyWalletEntriesHook } from '@/hooks/api';

import { MovementsSkeleton } from '../skeletons';
import HistoryPageClient from './page.client';

export const metadata: Metadata = {
  title: `${ME_CONTENT.history.title} — ${SITE_CONTENT.title}`,
};

export default function Page() {
  return (
    <section className="col-span-12 lg:col-span-8">
      <Suspense fallback={<MovementsSkeleton rows={6} />}>
        <History />
      </Suspense>
    </section>
  );
}

/** Never cached: the register is read on every request. */
async function History() {
  const page = await listMyWalletEntriesHook();

  return (
    <HistoryPageClient
      initialPage={page ?? { items: [], nextCursor: null, hasMore: false }}
    />
  );
}

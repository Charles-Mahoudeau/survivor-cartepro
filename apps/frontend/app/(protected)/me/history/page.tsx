import type { Metadata } from 'next';
import { Suspense } from 'react';

import { PageHeader } from '@/components/composites/page-header';
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
    <div className="page-enter">
      <PageHeader
        title={ME_CONTENT.history.title}
        subtitle={ME_CONTENT.history.subtitle}
      />
      <Suspense fallback={<MovementsSkeleton rows={6} />}>
        <History />
      </Suspense>
    </div>
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

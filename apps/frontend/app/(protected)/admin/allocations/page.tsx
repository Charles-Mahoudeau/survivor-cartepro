import type { Metadata } from 'next';
import { Suspense } from 'react';

import { ADMIN_CONTENT } from '@/content/admin';
import { SITE_CONTENT } from '@/content/site';
import { listAllocationsHook, listEmployersHook } from '@/hooks/api';

import { AllocationsClient } from './page.client';
import { AllocationsSkeleton } from './skeletons';

export const metadata: Metadata = {
  title: `${ADMIN_CONTENT.allocations.title} — ${SITE_CONTENT.title}`,
};

export default function Page() {
  return (
    <section className="col-span-12">
      <h1 className="mb-1 text-2xl font-semibold tracking-tight">
        {ADMIN_CONTENT.allocations.title}
      </h1>
      <p className="text-muted-foreground mb-5 max-w-2xl text-sm">
        {ADMIN_CONTENT.allocations.subtitle}
      </p>

      <Suspense fallback={<AllocationsSkeleton />}>
        <Ledger />
      </Suspense>
    </section>
  );
}

/** Never cached: an allocation applied a moment ago must show as settled. */
async function Ledger() {
  const [page, employers] = await Promise.all([
    listAllocationsHook(),
    listEmployersHook(),
  ]);

  return <AllocationsClient page={page} employers={employers.items} />;
}

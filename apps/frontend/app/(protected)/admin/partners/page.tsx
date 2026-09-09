import type { Metadata } from 'next';
import { Suspense } from 'react';

import { ADMIN_CONTENT } from '@/content/admin';
import { SITE_CONTENT } from '@/content/site';
import { listApplicationsHook } from '@/hooks/api';
import { partnerStatusSchema } from '@/lib/api/schemas/backend/partner';

import { ApplicationsClient } from './page.client';
import { QueueSkeleton } from './skeletons';
import { REVIEWABLE_STATUSES, type ReviewableStatus } from './statuses';

export const metadata: Metadata = {
  title: `${ADMIN_CONTENT.applications.title} — ${SITE_CONTENT.title}`,
};

const DEFAULT_STATUS: ReviewableStatus = 'pending';

/** Anything the filter cannot serve falls back to the queue that matters. */
function readStatus(value: string | string[] | undefined): ReviewableStatus {
  const parsed = partnerStatusSchema.safeParse(value);

  return parsed.success &&
    REVIEWABLE_STATUSES.includes(parsed.data as ReviewableStatus)
    ? (parsed.data as ReviewableStatus)
    : DEFAULT_STATUS;
}

export default function Page({ searchParams }: PageProps<'/admin/partners'>) {
  return (
    <section className="col-span-12">
      <h1 className="mb-1 text-2xl font-semibold tracking-tight">
        {ADMIN_CONTENT.applications.title}
      </h1>
      <p className="text-muted-foreground mb-5 max-w-2xl text-sm">
        {ADMIN_CONTENT.applications.subtitle}
      </p>

      <Suspense fallback={<QueueSkeleton />}>
        <Queue searchParams={searchParams} />
      </Suspense>
    </section>
  );
}

/**
 * Reads the filter and the queue under the boundary, so the heading
 * prerenders. Never cached: an instructed dossier must leave the queue on
 * the next look.
 */
async function Queue({
  searchParams,
}: {
  searchParams: PageProps<'/admin/partners'>['searchParams'];
}) {
  const status = readStatus((await searchParams).status);
  const page = await listApplicationsHook({ status });

  return <ApplicationsClient page={page} status={status} />;
}

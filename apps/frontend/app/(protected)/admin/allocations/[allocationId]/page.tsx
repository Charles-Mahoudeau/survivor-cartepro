import { RiArrowLeftLine } from '@remixicon/react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';

import { Card } from '@/components/composites/card';
import { DateTexte } from '@/components/composites/date-texte';
import { Montant } from '@/components/composites/montant';
import { Button } from '@/components/ui/button';
import { ADMIN_CONTENT } from '@/content/admin';
import { SITE_CONTENT } from '@/content/site';
import { getAllocationHook } from '@/hooks/api';

import { AllocationSkeleton } from '../skeletons';
import { ApplyForm } from './apply-form.client';

export const metadata: Metadata = {
  title: `${ADMIN_CONTENT.allocations.title} — ${SITE_CONTENT.title}`,
};

export default function Page({
  params,
}: PageProps<'/admin/allocations/[allocationId]'>) {
  return (
    <section className="col-span-12 lg:col-span-9">
      <Button asChild variant="ghost" size="sm" className="mb-3 -ml-2">
        <Link href="/admin/allocations">
          <RiArrowLeftLine aria-hidden className="size-4" />
          {ADMIN_CONTENT.allocation.back}
        </Link>
      </Button>

      <Suspense fallback={<AllocationSkeleton />}>
        <Detail params={params} />
      </Suspense>
    </section>
  );
}

/** Reads `params` and the allocation under the boundary, so the shell prerenders. */
async function Detail({
  params,
}: {
  params: PageProps<'/admin/allocations/[allocationId]'>['params'];
}) {
  const { allocationId } = await params;
  const allocation = await getAllocationHook(allocationId);

  return (
    <>
      <h1 className="mb-1 text-2xl font-semibold tracking-tight">
        {allocation.label}
      </h1>
      <p className="text-muted-foreground mb-5 text-sm">
        {ADMIN_CONTENT.allocations.createdOn}{' '}
        <DateTexte iso={allocation.createdAt} format="jour" />
      </p>

      <Card className="mb-4 p-5">
        <dl className="grid gap-4 sm:grid-cols-2">
          <Field label={ADMIN_CONTENT.allocation.employer}>
            {allocation.employerName}
          </Field>
          <Field label={ADMIN_CONTENT.allocation.amount}>
            <Montant amount={allocation.amount} mention={false} />
          </Field>
          <Field label={ADMIN_CONTENT.allocation.beneficiaries}>
            {allocation.beneficiaries.length}
          </Field>
          <Field label={ADMIN_CONTENT.allocation.total}>
            <Montant amount={allocation.total} mention={false} />
          </Field>
        </dl>
      </Card>

      {allocation.excluded.length > 0 ? (
        <Card className="mb-4 p-5">
          <h2 className="mb-2 text-sm font-medium">
            {ADMIN_CONTENT.allocation.excluded}
          </h2>
          <ul className="text-muted-foreground flex flex-col gap-1 text-sm">
            {allocation.excluded.map((wallet) => (
              <li key={wallet.walletId}>
                {wallet.holderName} —{' '}
                {ADMIN_CONTENT.allocation.excludedReason[wallet.reason]}
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      {allocation.status === 'draft' ? (
        <ApplyForm allocationId={allocation.id} />
      ) : (
        <Card className="p-5">
          <h2 className="mb-1 font-medium">
            {ADMIN_CONTENT.allocation.settled.title}
          </h2>
          <p className="text-muted-foreground text-sm">
            {ADMIN_CONTENT.allocation.settled.body}
          </p>
        </Card>
      )}
    </>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <dt className="text-muted-foreground mb-0.5 text-xs font-medium tracking-wide uppercase">
        {label}
      </dt>
      <dd className="text-sm">{children}</dd>
    </div>
  );
}

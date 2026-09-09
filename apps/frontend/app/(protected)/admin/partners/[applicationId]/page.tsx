import { RiArrowLeftLine } from '@remixicon/react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';

import { Card } from '@/components/composites/card';
import { DateTexte } from '@/components/composites/date-texte';
import { Button } from '@/components/ui/button';
import { ADMIN_CONTENT } from '@/content/admin';
import { SITE_CONTENT } from '@/content/site';
import { getApplicationHook } from '@/hooks/api';

import { DecisionForm } from './decision-form.client';
import { DossierSkeleton } from './skeletons';

export const metadata: Metadata = {
  title: `${ADMIN_CONTENT.applications.title} — ${SITE_CONTENT.title}`,
};

export default function Page({
  params,
}: PageProps<'/admin/partners/[applicationId]'>) {
  return (
    <section className="col-span-12 lg:col-span-9">
      <Button asChild variant="ghost" size="sm" className="mb-3 -ml-2">
        <Link href="/admin/partners">
          <RiArrowLeftLine aria-hidden className="size-4" />
          {ADMIN_CONTENT.application.back}
        </Link>
      </Button>

      <Suspense fallback={<DossierSkeleton />}>
        <Dossier params={params} />
      </Suspense>
    </section>
  );
}

/** Reads `params` and the dossier under the boundary, so the shell prerenders. */
async function Dossier({
  params,
}: {
  params: PageProps<'/admin/partners/[applicationId]'>['params'];
}) {
  const { applicationId } = await params;
  const application = await getApplicationHook(applicationId);

  return (
    <>
      <h1 className="mb-1 text-2xl font-semibold tracking-tight">
        {application.tradeName}
      </h1>
      <p className="text-muted-foreground mb-5 text-sm">
        {ADMIN_CONTENT.application.filedOn}{' '}
        <DateTexte iso={application.createdAt} format="jour" />
      </p>

      <Card className="mb-4 p-5">
        <dl className="grid gap-4 sm:grid-cols-2">
          <Field label={ADMIN_CONTENT.application.legalName}>
            {application.legalName}
          </Field>
          <Field label={ADMIN_CONTENT.application.siren}>
            <span className="font-mono tabular-nums">{application.siren}</span>
          </Field>
          <Field
            label={ADMIN_CONTENT.application.businessPurpose}
            className="sm:col-span-2"
          >
            {application.businessPurpose}
          </Field>
          <Field label={ADMIN_CONTENT.application.address}>
            {application.addressLine}, {application.postalCode}{' '}
            {application.city}
          </Field>
          <Field label={ADMIN_CONTENT.application.categories}>
            {application.categories.map((c) => c.displayName).join(', ')}
          </Field>
          <Field
            label={ADMIN_CONTENT.application.owner}
            className="sm:col-span-2"
          >
            {application.owner.name} · {application.owner.email}
          </Field>
        </dl>
      </Card>

      {application.status === 'pending' ? (
        <DecisionForm applicationId={application.id} />
      ) : (
        <Card className="p-5">
          <h2 className="mb-1 font-medium">
            {ADMIN_CONTENT.application.settled.title}
          </h2>
          <p className="text-muted-foreground text-sm">
            {ADMIN_CONTENT.application.settled.body}
          </p>
          <p className="text-muted-foreground mt-3 text-xs">
            {ADMIN_CONTENT.application.decidedOn}{' '}
            <DateTexte iso={application.updatedAt} format="jour" />
          </p>
        </Card>
      )}
    </>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <dt className="text-muted-foreground mb-0.5 text-xs font-medium tracking-wide uppercase">
        {label}
      </dt>
      <dd className="text-sm">{children}</dd>
    </div>
  );
}

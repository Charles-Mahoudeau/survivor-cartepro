import type { Metadata } from 'next';
import { connection } from 'next/server';
import { Suspense } from 'react';

import { Card } from '@/components/composites/card';
import { DateTexte } from '@/components/composites/date-texte';
import { PRO_CONTENT } from '@/content/pro';
import { SITE_CONTENT } from '@/content/site';
import {
  getMyPartnerProfileHook,
  listPartnerCategoriesHook,
} from '@/hooks/api';

import { ProfileForm } from './profile-form.client';
import { DossierSkeleton } from './skeletons';

export const metadata: Metadata = {
  title: `${PRO_CONTENT.account.title} — ${SITE_CONTENT.title}`,
};

const { account } = PRO_CONTENT;

export default function Page() {
  return (
    <section className="col-span-12 lg:col-span-8">
      <h1 className="mb-1 text-2xl font-semibold tracking-tight">
        {account.title}
      </h1>
      <p className="text-muted-foreground mb-5 max-w-2xl text-sm">
        {account.subtitle}
      </p>

      <Suspense fallback={<DossierSkeleton />}>
        <Dossier />
      </Suspense>
    </section>
  );
}

async function Dossier() {
  // Keeps this boundary out of the static shell: otherwise the build tries
  // to prerender it and eagerly runs the cached categories fetch offline.
  await connection();

  const [profile, categories] = await Promise.all([
    getMyPartnerProfileHook(),
    listPartnerCategoriesHook(),
  ]);

  return (
    <>
      <Card className="mb-4 p-5">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-medium">{account.status.title}</h2>
          <span className="bg-muted text-muted-foreground inline-flex h-7 items-center rounded-full px-3 text-xs font-medium">
            {account.status.labels[profile.status]}
          </span>
        </div>
        <p className="text-muted-foreground text-sm">
          {account.status.explanations[profile.status]}
        </p>
        {profile.lastDecision ? (
          <div className="border-border mt-4 border-t pt-4">
            <p className="text-muted-foreground mb-1 text-xs font-medium tracking-wide uppercase">
              {account.status.decision}{' '}
              <DateTexte iso={profile.lastDecision.createdAt} format="jour" />
            </p>
            <p className="text-sm whitespace-pre-line">
              {profile.lastDecision.reason}
            </p>
          </div>
        ) : null}
      </Card>

      <Card className="mb-4 p-5">
        <h2 className="mb-3 font-medium">{account.identity.title}</h2>
        <dl className="grid gap-4 sm:grid-cols-2">
          <Field label={account.identity.legalName}>{profile.legalName}</Field>
          <Field label={account.identity.siren}>
            <span className="font-mono tabular-nums">{profile.siren}</span>
          </Field>
          <Field
            label={account.identity.businessPurpose}
            className="sm:col-span-2"
          >
            {profile.businessPurpose}
          </Field>
        </dl>
        <p className="text-muted-foreground mt-4 text-xs">
          {account.identity.locked}
        </p>
      </Card>

      <ProfileForm profile={profile} categories={categories} />
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

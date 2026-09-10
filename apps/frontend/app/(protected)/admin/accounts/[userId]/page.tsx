import { RiArrowLeftLine } from '@remixicon/react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';

import { Card } from '@/components/composites/card';
import { DateTexte, formatDate } from '@/components/composites/date-texte';
import { Button } from '@/components/ui/button';
import { ADMIN_CONTENT } from '@/content/admin';
import { SITE_CONTENT } from '@/content/site';
import { getAccountHook } from '@/hooks/api';
import { getCurrentUser } from '@/lib/auth/session';

import { accountRoleLabel } from '../labels';
import { AccountSkeleton } from '../skeletons';
import { accountStatusOf } from '../status';
import { StatusForm } from './status-form.client';

export const metadata: Metadata = {
  title: `${ADMIN_CONTENT.accounts.title} — ${SITE_CONTENT.title}`,
};

export default function Page({
  params,
}: PageProps<'/admin/accounts/[userId]'>) {
  return (
    <section className="col-span-12 lg:col-span-9">
      <Button asChild variant="ghost" size="sm" className="mb-3 -ml-2">
        <Link href="/admin/accounts">
          <RiArrowLeftLine aria-hidden className="size-4" />
          {ADMIN_CONTENT.account.back}
        </Link>
      </Button>

      <Suspense fallback={<AccountSkeleton />}>
        <Detail params={params} />
      </Suspense>
    </section>
  );
}

async function Detail({
  params,
}: {
  params: PageProps<'/admin/accounts/[userId]'>['params'];
}) {
  const { userId } = await params;
  const [account, viewer] = await Promise.all([
    getAccountHook(userId),
    getCurrentUser(),
  ]);
  const status = accountStatusOf(account);

  return (
    <>
      <h1 className="mb-1 text-2xl font-semibold tracking-tight">
        {account.name}
      </h1>
      <p className="text-muted-foreground mb-5 text-sm">{account.email}</p>

      <Card className="mb-4 p-5">
        <dl className="grid gap-4 sm:grid-cols-2">
          <Field label={ADMIN_CONTENT.account.role}>
            {accountRoleLabel(account.role)}
          </Field>
          <Field label={ADMIN_CONTENT.account.status}>
            {ADMIN_CONTENT.accounts.status[status]}
            {status === 'suspended' && account.banExpires
              ? ` ${ADMIN_CONTENT.account.until(formatDate(account.banExpires))}`
              : null}
          </Field>
          <Field label={ADMIN_CONTENT.account.createdOn}>
            <DateTexte iso={account.createdAt} format="jour" />
          </Field>
          {status !== 'active' && account.banReason ? (
            <Field
              label={ADMIN_CONTENT.account.reason}
              className="sm:col-span-2"
            >
              {account.banReason}
            </Field>
          ) : null}
        </dl>
      </Card>

      {viewer?.id === account.id ? (
        <Card className="p-5">
          <p className="text-muted-foreground text-sm">
            {ADMIN_CONTENT.account.self}
          </p>
        </Card>
      ) : (
        <StatusForm userId={account.id} status={status} />
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

import type { Metadata } from 'next';
import { Suspense } from 'react';

import { ADMIN_CONTENT } from '@/content/admin';
import { SITE_CONTENT } from '@/content/site';
import { listAccountsHook } from '@/hooks/api';
import { accountRoleSchema } from '@/lib/api/schemas/backend/account';

import { AccountsClient } from './page.client';
import {
  ACCOUNTS_PAGE_PARAM,
  ACCOUNTS_ROLE_PARAM,
  ACCOUNTS_SEARCH_PARAM,
} from './search-params';
import { AccountsSkeleton } from './skeletons';
import { accountStatusOf } from './status';

export const metadata: Metadata = {
  title: `${ADMIN_CONTENT.accounts.title} — ${SITE_CONTENT.title}`,
};

const FIRST_PAGE = 1;

function first(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value) ?? '';
}

export default function Page({ searchParams }: PageProps<'/admin/accounts'>) {
  return (
    <section className="col-span-12">
      <h1 className="mb-1 text-2xl font-semibold tracking-tight">
        {ADMIN_CONTENT.accounts.title}
      </h1>
      <p className="text-muted-foreground mb-5 max-w-2xl text-sm">
        {ADMIN_CONTENT.accounts.subtitle}
      </p>

      <Suspense fallback={<AccountsSkeleton />}>
        <Accounts searchParams={searchParams} />
      </Suspense>
    </section>
  );
}

async function Accounts({
  searchParams,
}: {
  searchParams: PageProps<'/admin/accounts'>['searchParams'];
}) {
  const params = await searchParams;
  const search = first(params[ACCOUNTS_SEARCH_PARAM]).trim().toLowerCase();
  const role = accountRoleSchema.safeParse(first(params[ACCOUNTS_ROLE_PARAM]));
  const requestedPage = Number.parseInt(first(params[ACCOUNTS_PAGE_PARAM]), 10);
  const page =
    Number.isInteger(requestedPage) && requestedPage >= FIRST_PAGE
      ? requestedPage
      : FIRST_PAGE;

  const accounts = await listAccountsHook({
    search: search || undefined,
    role: role.success ? role.data : undefined,
    page,
  });

  return (
    <AccountsClient
      accounts={accounts.users.map((account) => ({
        ...account,
        status: accountStatusOf(account),
      }))}
      total={accounts.total}
      search={search}
      role={role.success ? role.data : null}
      page={page}
    />
  );
}

'use client';

import {
  RiArrowLeftSLine,
  RiArrowRightLine,
  RiArrowRightSLine,
  RiSearchLine,
} from '@remixicon/react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { type FormEvent, useState } from 'react';

import { Card } from '@/components/composites/card';
import { DateTexte } from '@/components/composites/date-texte';
import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { Input } from '@/components/ui/input';
import { ADMIN_CONTENT } from '@/content/admin';
import {
  ACCOUNTS_PAGE_SIZE,
  type AccountRole,
} from '@/lib/api/schemas/backend/account';

import { accountRoleLabel } from './labels';
import {
  ACCOUNTS_PAGE_PARAM,
  ACCOUNTS_ROLE_PARAM,
  ACCOUNTS_SEARCH_PARAM,
  FILTERABLE_ROLES,
} from './search-params';
import type { ListedAccount } from './status';

interface ListLocation {
  search: string;
  role: AccountRole | null;
  page: number;
}

interface AccountsClientProps extends ListLocation {
  accounts: ListedAccount[];
  total: number;
}

function queryOf({ search, role, page }: ListLocation): string {
  const params = new URLSearchParams();
  if (search) {
    params.set(ACCOUNTS_SEARCH_PARAM, search);
  }
  if (role) {
    params.set(ACCOUNTS_ROLE_PARAM, role);
  }
  if (page > 1) {
    params.set(ACCOUNTS_PAGE_PARAM, String(page));
  }
  return params.toString();
}

function SearchForm({
  search,
  onSearch,
}: {
  search: string;
  onSearch: (search: string) => void;
}) {
  const [text, setText] = useState(search);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSearch(text.trim().toLowerCase());
  }

  return (
    <form role="search" onSubmit={submit} className="mb-4 flex gap-2">
      <div className="relative flex-1">
        <RiSearchLine
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[color:var(--muted-foreground)]"
        />
        <Input
          type="search"
          aria-label={ADMIN_CONTENT.accounts.searchLabel}
          placeholder={ADMIN_CONTENT.accounts.searchPlaceholder}
          className="pl-9"
          value={text}
          onChange={(event) => setText(event.target.value)}
        />
      </div>
      <Button type="submit" variant="outline">
        {ADMIN_CONTENT.accounts.search}
      </Button>
    </form>
  );
}

/** The account list, with its email search, its role filter and its pages. */
export function AccountsClient({
  accounts,
  total,
  search,
  role,
  page,
}: AccountsClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const pageCount = Math.max(1, Math.ceil(total / ACCOUNTS_PAGE_SIZE));

  function hrefOf(location: ListLocation): string {
    const query = queryOf(location);
    return query ? `${pathname}?${query}` : pathname;
  }

  return (
    <>
      <SearchForm
        key={search}
        search={search}
        onSearch={(next) =>
          router.push(hrefOf({ search: next, role, page: 1 }))
        }
      />

      <div
        className="mb-4 flex flex-wrap gap-2"
        role="group"
        aria-label={ADMIN_CONTENT.accounts.roleFilter}
      >
        <Chip
          pressed={role === null}
          onClick={() => router.push(hrefOf({ search, role: null, page: 1 }))}
        >
          {ADMIN_CONTENT.accounts.allRoles}
        </Chip>
        {FILTERABLE_ROLES.map((candidate) => (
          <Chip
            key={candidate}
            pressed={candidate === role}
            onClick={() =>
              router.push(hrefOf({ search, role: candidate, page: 1 }))
            }
          >
            {accountRoleLabel(candidate)}
          </Chip>
        ))}
      </div>

      <p className="text-muted-foreground mb-2 text-xs" aria-live="polite">
        {ADMIN_CONTENT.accounts.total(total)}
      </p>

      {accounts.length === 0 ? (
        <Card className="p-6">
          <p className="text-muted-foreground text-sm">
            {ADMIN_CONTENT.accounts.empty}
          </p>
        </Card>
      ) : (
        <Card className="divide-border divide-y p-0">
          {accounts.map((account) => (
            <article
              key={account.id}
              className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
            >
              <div className="min-w-0">
                <p className="truncate font-medium">{account.name}</p>
                <p className="text-muted-foreground truncate text-xs">
                  {account.email} · {accountRoleLabel(account.role)}
                </p>
                <p className="text-muted-foreground mt-0.5 text-xs">
                  {ADMIN_CONTENT.accounts.createdOn}{' '}
                  <DateTexte iso={account.createdAt} format="jour" />
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-3">
                <span className="bg-muted text-muted-foreground inline-flex h-8 items-center rounded-full px-3 text-xs font-medium">
                  {ADMIN_CONTENT.accounts.status[account.status]}
                </span>
                <Button asChild variant="ghost" size="sm">
                  <Link href={`/admin/accounts/${account.id}`}>
                    {ADMIN_CONTENT.accounts.open}
                    <RiArrowRightLine aria-hidden className="size-4" />
                  </Link>
                </Button>
              </div>
            </article>
          ))}
        </Card>
      )}

      {pageCount > 1 ? (
        <nav
          className="mt-4 flex items-center justify-between gap-3"
          aria-label={ADMIN_CONTENT.accounts.pagination}
        >
          {page > 1 ? (
            <Button asChild variant="outline" size="sm">
              <Link href={hrefOf({ search, role, page: page - 1 })}>
                <RiArrowLeftSLine aria-hidden className="size-4" />
                {ADMIN_CONTENT.accounts.previous}
              </Link>
            </Button>
          ) : (
            <span />
          )}
          <span className="text-muted-foreground text-xs">
            {ADMIN_CONTENT.accounts.pageOf(page, pageCount)}
          </span>
          {page < pageCount ? (
            <Button asChild variant="outline" size="sm">
              <Link href={hrefOf({ search, role, page: page + 1 })}>
                {ADMIN_CONTENT.accounts.next}
                <RiArrowRightSLine aria-hidden className="size-4" />
              </Link>
            </Button>
          ) : (
            <span />
          )}
        </nav>
      ) : null}
    </>
  );
}

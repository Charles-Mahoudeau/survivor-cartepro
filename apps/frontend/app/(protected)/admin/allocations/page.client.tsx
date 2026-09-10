'use client';

import { RiArrowRightLine } from '@remixicon/react';
import Link from 'next/link';
import { useAction } from 'next-safe-action/hooks';
import { useState } from 'react';
import { toast } from 'sonner';

import { Card } from '@/components/composites/card';
import { DateTexte } from '@/components/composites/date-texte';
import { Montant } from '@/components/composites/montant';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ADMIN_CONTENT } from '@/content/admin';
import type { AllocationPage } from '@/lib/api/schemas/backend/allocation';
import { MAX_ALLOCATION_LABEL_LENGTH } from '@/lib/api/schemas/backend/allocation';
import type { Employer } from '@/lib/api/schemas/backend/employer';

import { createAllocationAction } from './actions/create-allocation.action';

const CENTS_STEP = '0.01';

interface AllocationsClientProps {
  page: AllocationPage;
  employers: Employer[];
}

export function AllocationsClient({ page, employers }: AllocationsClientProps) {
  const [employerId, setEmployerId] = useState('');
  const [label, setLabel] = useState('');
  const [amount, setAmount] = useState('');

  const create = useAction(createAllocationAction, {
    onSuccess: () => {
      setLabel('');
      setAmount('');
    },
    onError: ({ error }) =>
      toast.error(error.serverError ?? ADMIN_CONTENT.error.body),
  });

  function submit(event: React.FormEvent) {
    event.preventDefault();

    const euros = Number(amount);

    if (!employerId) {
      toast.error(ADMIN_CONTENT.allocations.employerRequired);
      return;
    }
    if (!label.trim()) {
      toast.error(ADMIN_CONTENT.allocations.labelRequired);
      return;
    }
    if (!Number.isFinite(euros) || euros <= 0) {
      toast.error(ADMIN_CONTENT.allocations.amountRequired);
      return;
    }

    create.execute({ employerId, label: label.trim(), amount: euros });
  }

  const selected = employers.find((employer) => employer.id === employerId);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
      <div>
        {page.items.length === 0 ? (
          <Card className="p-6">
            <p className="text-muted-foreground text-sm">
              {ADMIN_CONTENT.allocations.empty}
            </p>
          </Card>
        ) : (
          <Card className="divide-border divide-y p-0">
            {page.items.map((allocation) => (
              <article
                key={allocation.id}
                className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{allocation.label}</p>
                  <p className="text-muted-foreground truncate text-xs">
                    {allocation.employerName} ·{' '}
                    <Montant amount={allocation.amount} mention={false} />{' '}
                    {ADMIN_CONTENT.allocations.perEmployee}
                  </p>
                  <p className="text-muted-foreground mt-0.5 text-xs">
                    {ADMIN_CONTENT.allocations.createdOn}{' '}
                    <DateTexte iso={allocation.createdAt} format="jour" />
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-3">
                  <span className="bg-muted text-muted-foreground inline-flex h-8 items-center rounded-full px-3 text-xs font-medium">
                    {ADMIN_CONTENT.allocations.status[allocation.status]}
                  </span>
                  <Button asChild variant="ghost" size="sm">
                    <Link href={`/admin/allocations/${allocation.id}`}>
                      {ADMIN_CONTENT.allocations.open}
                      <RiArrowRightLine aria-hidden className="size-4" />
                    </Link>
                  </Button>
                </div>
              </article>
            ))}
          </Card>
        )}
      </div>

      <Card className="h-fit p-5">
        <h2 className="mb-4 font-medium">
          {ADMIN_CONTENT.allocations.createTitle}
        </h2>

        <form onSubmit={submit} noValidate className="flex flex-col gap-4">
          <div>
            <label
              htmlFor="employer"
              className="mb-1 block text-sm font-medium"
            >
              {ADMIN_CONTENT.allocations.employerLabel}
            </label>
            <select
              id="employer"
              name="employerId"
              value={employerId}
              onChange={(event) => setEmployerId(event.target.value)}
              disabled={create.isPending}
              className="border-input bg-card focus-visible:ring-ring/30 h-9 w-full rounded-lg border px-3 text-sm focus-visible:ring-3 focus-visible:outline-none disabled:opacity-60"
            >
              <option value="">
                {ADMIN_CONTENT.allocations.employerPlaceholder}
              </option>
              {employers.map((employer) => (
                <option key={employer.id} value={employer.id}>
                  {employer.name}
                </option>
              ))}
            </select>
            {selected ? (
              <p className="text-muted-foreground mt-1 text-xs">
                {ADMIN_CONTENT.allocations.wallets(selected.activeWalletCount)}
              </p>
            ) : null}
          </div>

          <div>
            <label htmlFor="label" className="mb-1 block text-sm font-medium">
              {ADMIN_CONTENT.allocations.labelLabel}
            </label>
            <Input
              id="label"
              name="label"
              maxLength={MAX_ALLOCATION_LABEL_LENGTH}
              value={label}
              onChange={(event) => setLabel(event.target.value)}
              disabled={create.isPending}
              placeholder={ADMIN_CONTENT.allocations.labelPlaceholder}
            />
          </div>

          <div>
            <label
              htmlFor="allocation-amount"
              className="mb-1 block text-sm font-medium"
            >
              {ADMIN_CONTENT.allocations.amountLabel}
            </label>
            <Input
              id="allocation-amount"
              name="amount"
              type="number"
              inputMode="decimal"
              min={CENTS_STEP}
              step={CENTS_STEP}
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              disabled={create.isPending}
              placeholder="0,00"
              className="tabular-nums"
            />
            <p className="text-muted-foreground mt-1 text-xs">
              {ADMIN_CONTENT.allocations.amountHelp}
            </p>
          </div>

          <Button type="submit" disabled={create.isPending}>
            {create.isPending
              ? ADMIN_CONTENT.allocations.creating
              : ADMIN_CONTENT.allocations.create}
          </Button>
        </form>
      </Card>
    </div>
  );
}

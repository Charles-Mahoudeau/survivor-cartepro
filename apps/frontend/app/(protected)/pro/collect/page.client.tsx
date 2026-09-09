'use client';

import { RiCheckLine, RiRefreshLine } from '@remixicon/react';
import { useAction } from 'next-safe-action/hooks';
import { useState } from 'react';
import { toast } from 'sonner';

import { Card } from '@/components/composites/card';
import { DateTexte } from '@/components/composites/date-texte';
import { Montant } from '@/components/composites/montant';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PRO_CONTENT } from '@/content/pro';
import { MAX_PARTNER_REFERENCE_LENGTH } from '@/lib/api/schemas/backend/payment';
import { SHORT_CODE_LENGTH } from '@/lib/api/schemas/backend/payment-token';
import type { PaymentReceipt } from '@/lib/api/schemas/backend/payment';

import { collectPaymentAction } from './actions/collect-payment.action';

const CENTS_STEP = '0.01';

export function CollectClient() {
  const [shortCode, setShortCode] = useState('');
  const [amount, setAmount] = useState('');
  const [reference, setReference] = useState('');
  const [receipt, setReceipt] = useState<PaymentReceipt | null>(null);

  const collect = useAction(collectPaymentAction, {
    onSuccess: ({ data }) => {
      setReceipt(data ?? null);
      setShortCode('');
      setAmount('');
      setReference('');
    },
    onError: ({ error }) =>
      toast.error(error.serverError ?? PRO_CONTENT.error.body),
  });

  function submit(event: React.FormEvent) {
    event.preventDefault();

    const code = shortCode.trim().toUpperCase();
    const euros = Number(amount);

    if (code.length !== SHORT_CODE_LENGTH) {
      toast.error(PRO_CONTENT.collect.codeRequired);
      return;
    }
    if (!Number.isFinite(euros) || euros <= 0) {
      toast.error(PRO_CONTENT.collect.amountRequired);
      return;
    }

    collect.execute({
      shortCode: code,
      amount: euros,
      partnerReference: reference.trim() || undefined,
    });
  }

  if (receipt) {
    return (
      <Card className="p-6">
        <div className="mb-4 flex items-center gap-2">
          <RiCheckLine aria-hidden className="size-5" />
          <h2 className="font-medium">{PRO_CONTENT.collect.receipt.title}</h2>
        </div>

        <dl className="grid gap-3 sm:grid-cols-2">
          <Field label={PRO_CONTENT.collect.receipt.amount}>
            <Montant amount={receipt.amount} mention={false} />
          </Field>
          <Field label={PRO_CONTENT.collect.receipt.at}>
            <DateTexte iso={receipt.createdAt} format="jour" />
          </Field>
          {receipt.partnerReference ? (
            <Field label={PRO_CONTENT.collect.receipt.reference}>
              {receipt.partnerReference}
            </Field>
          ) : null}
          <Field
            label={PRO_CONTENT.collect.receipt.identifier}
            className="sm:col-span-2"
          >
            <span className="font-mono text-xs">{receipt.paymentId}</span>
          </Field>
        </dl>

        <p className="text-muted-foreground mt-4 text-xs">
          {PRO_CONTENT.collect.receipt.note}
        </p>

        <Button className="mt-5" onClick={() => setReceipt(null)}>
          <RiRefreshLine aria-hidden className="size-4" />
          {PRO_CONTENT.collect.reset}
        </Button>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <form onSubmit={submit} noValidate className="flex flex-col gap-5">
        <div>
          <label
            htmlFor="short-code"
            className="mb-1 block text-sm font-medium"
          >
            {PRO_CONTENT.collect.codeLabel}
          </label>
          <Input
            id="short-code"
            name="shortCode"
            inputMode="text"
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            maxLength={SHORT_CODE_LENGTH}
            value={shortCode}
            onChange={(event) => setShortCode(event.target.value.toUpperCase())}
            disabled={collect.isPending}
            placeholder={PRO_CONTENT.collect.codePlaceholder}
            className="font-mono text-lg tracking-[0.25em] uppercase"
          />
          <p className="text-muted-foreground mt-1 text-xs">
            {PRO_CONTENT.collect.codeHelp}
          </p>
        </div>

        <div>
          <label htmlFor="amount" className="mb-1 block text-sm font-medium">
            {PRO_CONTENT.collect.amountLabel}
          </label>
          <Input
            id="amount"
            name="amount"
            type="number"
            inputMode="decimal"
            min={CENTS_STEP}
            step={CENTS_STEP}
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            disabled={collect.isPending}
            placeholder="0,00"
            className="text-lg tabular-nums"
          />
          <p className="text-muted-foreground mt-1 text-xs">
            {PRO_CONTENT.collect.amountHelp}
          </p>
        </div>

        <div>
          <label htmlFor="reference" className="mb-1 block text-sm font-medium">
            {PRO_CONTENT.collect.referenceLabel}{' '}
            <span className="text-muted-foreground font-normal">
              ({PRO_CONTENT.collect.referenceOptional})
            </span>
          </label>
          <Input
            id="reference"
            name="partnerReference"
            autoComplete="off"
            maxLength={MAX_PARTNER_REFERENCE_LENGTH}
            value={reference}
            onChange={(event) => setReference(event.target.value)}
            disabled={collect.isPending}
            placeholder={PRO_CONTENT.collect.referencePlaceholder}
          />
          <p className="text-muted-foreground mt-1 text-xs">
            {PRO_CONTENT.collect.referenceHelp}
          </p>
        </div>

        <Button
          type="submit"
          disabled={collect.isPending}
          className="self-start"
        >
          {collect.isPending
            ? PRO_CONTENT.collect.submitting
            : PRO_CONTENT.collect.submit}
        </Button>
      </form>
    </Card>
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

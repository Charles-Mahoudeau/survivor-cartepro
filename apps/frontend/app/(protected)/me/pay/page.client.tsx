'use client';

import { RiRefreshLine, RiCloseLine, RiQrCodeLine } from '@remixicon/react';
import { useAction } from 'next-safe-action/hooks';
import { useEffect, useState } from 'react';
import QRCode from 'react-qr-code';
import { toast } from 'sonner';

import { Card } from '@/components/composites/card';
import { Button } from '@/components/ui/button';
import { ME_CONTENT } from '@/content/me';
import type { Amount } from '@/lib/api/schemas/common/amount';
import type { PaymentToken } from '@/lib/api/schemas/backend/payment-token';
import type { WalletStatus } from '@/lib/api/schemas/backend/wallet';

import { issuePaymentTokenAction } from './actions/issue-payment-token.action';
import { revokePaymentTokenAction } from './actions/revoke-payment-token.action';

const SECONDS_PER_MINUTE = 60;
const MILLISECONDS_PER_SECOND = 1000;
const TICK_MS = 1000;
const QR_SIZE_PX = 208;

/** Groups the eight glyphs in pairs, the way a code is read aloud. */
function spellOut(shortCode: string): string {
  return shortCode.replace(/(.{2})(?=.)/g, '$1 ');
}

function secondsLeft(expiresAt: string, now: number): number {
  const remaining = new Date(expiresAt).getTime() - now;
  return Math.max(0, Math.floor(remaining / MILLISECONDS_PER_SECOND));
}

function formatCountdown(seconds: number): string {
  const minutes = Math.floor(seconds / SECONDS_PER_MINUTE);
  const rest = seconds % SECONDS_PER_MINUTE;
  return `${minutes}:${String(rest).padStart(2, '0')}`;
}

interface PayClientProps {
  initialToken: PaymentToken | null;
  walletStatus: WalletStatus | null;
  balance: Amount | null;
}

export function PayClient({
  initialToken,
  walletStatus,
  balance,
}: PayClientProps) {
  const [token, setToken] = useState(initialToken);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), TICK_MS);

    return () => clearInterval(interval);
  }, []);

  const remaining = token ? secondsLeft(token.expiresAt, now) : 0;

  const issue = useAction(issuePaymentTokenAction, {
    onSuccess: ({ data }) => {
      setToken(data ?? null);
      setNow(Date.now());
    },
    onError: ({ error }) =>
      toast.error(error.serverError ?? ME_CONTENT.error.body),
  });

  const revoke = useAction(revokePaymentTokenAction, {
    onSuccess: () => setToken(null),
    onError: ({ error }) =>
      toast.error(error.serverError ?? ME_CONTENT.error.body),
  });

  if (walletStatus === null) {
    return <Notice>{ME_CONTENT.pay.noWallet}</Notice>;
  }

  if (walletStatus === 'disabled') {
    return <Notice>{ME_CONTENT.pay.disabled}</Notice>;
  }

  if (Number(balance ?? 0) <= 0) {
    return <Notice>{ME_CONTENT.pay.emptyBalance}</Notice>;
  }

  const expired = token !== null && remaining === 0;

  return (
    <Card className="flex flex-col items-center p-6 md:p-8">
      {token && !expired ? (
        <>
          <p className="text-muted-foreground mb-3 text-xs font-medium tracking-wide uppercase">
            {ME_CONTENT.pay.scanLabel}
          </p>
          <div className="rounded-xl bg-white p-4">
            <QRCode
              value={token.qrPayload}
              size={QR_SIZE_PX}
              level="M"
              title={ME_CONTENT.pay.scanLabel}
            />
          </div>

          <p className="text-muted-foreground mt-6 mb-1 text-xs font-medium tracking-wide uppercase">
            {ME_CONTENT.pay.shortCodeLabel}
          </p>
          <p className="font-mono text-3xl font-semibold tracking-[0.2em] tabular-nums">
            {spellOut(token.shortCode)}
          </p>

          <p
            className="text-muted-foreground mt-4 text-sm tabular-nums"
            aria-live="polite"
            suppressHydrationWarning
          >
            {ME_CONTENT.pay.expiresIn} {formatCountdown(remaining)}
          </p>
        </>
      ) : (
        <div className="flex flex-col items-center py-6 text-center">
          <RiQrCodeLine
            aria-hidden
            className="text-muted-foreground mb-3 size-10"
          />
          <p className="text-muted-foreground max-w-sm text-sm">
            {expired ? ME_CONTENT.pay.expired : ME_CONTENT.pay.idle}
          </p>
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
        <Button
          onClick={() => issue.execute()}
          disabled={issue.isPending || revoke.isPending}
        >
          <RiRefreshLine aria-hidden className="size-4" />
          {issue.isPending
            ? ME_CONTENT.pay.generating
            : token && !expired
              ? ME_CONTENT.pay.regenerate
              : ME_CONTENT.pay.generate}
        </Button>

        {token && !expired ? (
          <Button
            variant="ghost"
            onClick={() => revoke.execute()}
            disabled={issue.isPending || revoke.isPending}
          >
            <RiCloseLine aria-hidden className="size-4" />
            {revoke.isPending
              ? ME_CONTENT.pay.cancelling
              : ME_CONTENT.pay.cancel}
          </Button>
        ) : null}
      </div>

      <p className="text-muted-foreground mt-6 max-w-sm text-center text-xs">
        {ME_CONTENT.pay.singleUse}
      </p>
      <p className="text-muted-foreground mt-2 max-w-sm text-center text-xs">
        <span className="text-foreground font-medium">
          {ME_CONTENT.pay.offlineNote}
        </span>{' '}
        {ME_CONTENT.pay.offlineNoteBody}
      </p>
    </Card>
  );
}

function Notice({ children }: { children: string }) {
  return (
    <Card className="p-6 md:p-8">
      <p className="text-muted-foreground text-sm">{children}</p>
    </Card>
  );
}

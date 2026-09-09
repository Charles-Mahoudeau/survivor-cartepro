import type { Metadata } from 'next';
import { Suspense } from 'react';

import { BandeauSimulation } from '@/components/composites/simulation-banner';
import { ME_CONTENT } from '@/content/me';
import { SITE_CONTENT } from '@/content/site';
import { getCurrentPaymentTokenHook, getMyWalletHook } from '@/hooks/api';

import { PaySkeleton } from './skeletons';
import { PayClient } from './page.client';

export const metadata: Metadata = {
  title: `${ME_CONTENT.pay.title} — ${SITE_CONTENT.title}`,
};

export default function Page() {
  return (
    <>
      <section className="col-span-12 lg:col-span-8">
        <h1 className="mb-1 text-2xl font-semibold tracking-tight">
          {ME_CONTENT.pay.title}
        </h1>
        <p className="text-muted-foreground mb-4 text-sm">
          {ME_CONTENT.pay.subtitle}
        </p>
        <Suspense fallback={<PaySkeleton />}>
          <PaymentCode />
        </Suspense>
      </section>

      <section className="col-span-12 lg:col-span-8">
        <BandeauSimulation />
      </section>
    </>
  );
}

/**
 * Never cached: a token lives a few minutes and a stale one sends someone to
 * a till with a code the server has already revoked.
 */
async function PaymentCode() {
  const [wallet, token] = await Promise.all([
    getMyWalletHook(),
    getCurrentPaymentTokenHook(),
  ]);

  return (
    <PayClient
      initialToken={token}
      walletStatus={wallet?.status ?? null}
      balance={wallet?.balance ?? null}
    />
  );
}

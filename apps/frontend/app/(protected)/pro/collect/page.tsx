import type { Metadata } from 'next';

import { PRO_CONTENT } from '@/content/pro';
import { SITE_CONTENT } from '@/content/site';

import { CollectClient } from './page.client';

export const metadata: Metadata = {
  title: `${PRO_CONTENT.collect.title} — ${SITE_CONTENT.title}`,
};

/**
 * Nothing is read before the till can type: whether the establishment may
 * collect is the server's call, and asking twice would only add a way for the
 * two answers to disagree.
 */
export default function Page() {
  return (
    <section className="col-span-12 lg:col-span-7">
      <h1 className="mb-1 text-2xl font-semibold tracking-tight">
        {PRO_CONTENT.collect.title}
      </h1>
      <p className="text-muted-foreground mb-5 text-sm">
        {PRO_CONTENT.collect.subtitle}
      </p>

      <CollectClient />
    </section>
  );
}

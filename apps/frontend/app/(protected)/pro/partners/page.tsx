import type { Metadata } from 'next';
import { Suspense } from 'react';

import { Catalogue } from '@/components/composites/catalogue/catalogue';
import { CatalogueSkeleton } from '@/components/composites/catalogue/skeleton';
import { PRO_CONTENT } from '@/content/pro';
import { SITE_CONTENT } from '@/content/site';

export const metadata: Metadata = {
  title: `${PRO_CONTENT.partners.title} — ${SITE_CONTENT.title}`,
};

export default function Page({ searchParams }: PageProps<'/pro/partners'>) {
  return (
    <section className="col-span-12 lg:col-span-8">
      <h1 className="mb-1 text-2xl font-semibold tracking-tight">
        {PRO_CONTENT.partners.title}
      </h1>
      <p className="text-muted-foreground mb-5 max-w-2xl text-sm">
        {PRO_CONTENT.partners.subtitle}
      </p>

      <Suspense fallback={<CatalogueSkeleton />}>
        <Catalogue searchParams={searchParams} />
      </Suspense>
    </section>
  );
}

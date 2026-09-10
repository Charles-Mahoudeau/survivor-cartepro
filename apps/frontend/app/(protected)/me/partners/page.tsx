import type { Metadata } from 'next';
import { Suspense } from 'react';

import { Catalogue } from '@/components/composites/catalogue/catalogue';
import { CatalogueSkeleton } from '@/components/composites/catalogue/skeleton';
import { ME_CONTENT } from '@/content/me';
import { SITE_CONTENT } from '@/content/site';

export const metadata: Metadata = {
  title: `${ME_CONTENT.partners.title} — ${SITE_CONTENT.title}`,
};

export default function Page({ searchParams }: PageProps<'/me/partners'>) {
  return (
    <section className="col-span-12 lg:col-span-8">
      <Suspense fallback={<CatalogueSkeleton />}>
        <Catalogue searchParams={searchParams} />
      </Suspense>
    </section>
  );
}

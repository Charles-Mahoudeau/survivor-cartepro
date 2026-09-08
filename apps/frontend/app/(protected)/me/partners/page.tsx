import type { Metadata } from 'next';
import { Suspense } from 'react';

import { ME_CONTENT } from '@/content/me';
import { SITE_CONTENT } from '@/content/site';
import { listPartnerCategoriesHook, listPartnersHook } from '@/hooks/api';

import PartnersPageClient from './page.client';
import {
  PARTNERS_CATEGORY_PARAM,
  PARTNERS_SEARCH_PARAM,
} from './search-params';
import { PartnersSkeleton } from './skeletons';

export const metadata: Metadata = {
  title: `${ME_CONTENT.partners.title} — ${SITE_CONTENT.title}`,
};

function first(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value) ?? '';
}

export default function Page({ searchParams }: PageProps<'/me/partners'>) {
  return (
    <section className="col-span-12 lg:col-span-8">
      <Suspense fallback={<PartnersSkeleton />}>
        <Catalogue searchParams={searchParams} />
      </Suspense>
    </section>
  );
}

/**
 * The catalogue is cached and keyed by its filters; the category list needs
 * the session. Both start at once.
 */
async function Catalogue({
  searchParams,
}: {
  searchParams: PageProps<'/me/partners'>['searchParams'];
}) {
  const params = await searchParams;
  const search = first(params[PARTNERS_SEARCH_PARAM]).trim();
  const category = first(params[PARTNERS_CATEGORY_PARAM]).trim();

  const [page, categories] = await Promise.all([
    listPartnersHook({
      search: search || undefined,
      category: category || undefined,
    }),
    listPartnerCategoriesHook(),
  ]);

  return (
    <PartnersPageClient
      initialPage={page}
      categories={categories}
      search={search}
      category={category}
    />
  );
}

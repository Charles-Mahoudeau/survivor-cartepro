import { listPartnerCategoriesHook, listPartnersHook } from '@/hooks/api';

import { CatalogueClient } from './catalogue.client';
import {
  PARTNERS_CATEGORY_PARAM,
  PARTNERS_SEARCH_PARAM,
} from './search-params';

type CatalogueSearchParams = Promise<
  Record<string, string | string[] | undefined>
>;

function first(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value) ?? '';
}

/** Reads the filters from the URL, then loads the partners and the categories at once. */
export async function Catalogue({
  searchParams,
}: {
  searchParams: CatalogueSearchParams;
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
    <CatalogueClient
      initialPage={page}
      categories={categories}
      search={search}
      category={category}
    />
  );
}

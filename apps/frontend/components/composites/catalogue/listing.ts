import type {
  ListPartnersQuery,
  Partner,
  PartnerPage,
} from '@/lib/api/schemas/backend/partner';

import { type Filters, sameFilters } from './filters';

/** The partners shown for one set of filters, grown page by page. */
export interface Listing {
  filters: Filters;
  partners: Partner[];
  nextCursor: string | null;
}

export function listingOf(page: PartnerPage, filters: Filters): Listing {
  return { filters, partners: page.items, nextCursor: page.nextCursor };
}

/** The listing to show: the one already grown while the filters hold, the first page served once they change. */
export function listingFor(
  listing: Listing,
  page: PartnerPage,
  filters: Filters,
): Listing {
  return sameFilters(listing.filters, filters)
    ? listing
    : listingOf(page, filters);
}

export function nextPageQuery(
  listing: Listing,
  cursor: string,
): ListPartnersQuery {
  return {
    cursor,
    search: listing.filters.search || undefined,
    category: listing.filters.category || undefined,
  };
}

export function continuesListing(
  listing: Listing,
  query: ListPartnersQuery,
): boolean {
  return (
    query.cursor === listing.nextCursor &&
    sameFilters(listing.filters, {
      search: query.search ?? '',
      category: query.category ?? '',
    })
  );
}

/** Appends a page to the listing it was requested for, and drops a page requested for any other. */
export function appendPage(
  listing: Listing,
  query: ListPartnersQuery,
  page: PartnerPage,
): Listing {
  if (!continuesListing(listing, query)) {
    return listing;
  }
  return {
    ...listing,
    partners: [...listing.partners, ...page.items],
    nextCursor: page.nextCursor,
  };
}

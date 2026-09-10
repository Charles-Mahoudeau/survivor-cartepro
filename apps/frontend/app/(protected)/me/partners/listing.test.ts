import { describe, expect, it } from 'bun:test';

import type { Partner, PartnerPage } from '@/lib/api/schemas/backend/partner';

import {
  appendPage,
  continuesListing,
  listingFor,
  listingOf,
  nextPageQuery,
} from './listing';

function partner(id: string): Partner {
  return {
    id,
    legalName: id,
    tradeName: id,
    addressLine: '',
    postalCode: '',
    city: '',
    latitude: 0,
    longitude: 0,
    categories: [],
  };
}

function page(ids: string[], nextCursor: string | null = null): PartnerPage {
  return { items: ids.map(partner), nextCursor, hasMore: nextCursor !== null };
}

function idsOf(partners: Partner[]): string[] {
  return partners.map((item) => item.id);
}

const unfiltered = { search: '', category: '' };
const lyon = { search: 'lyon', category: '' };

describe('listingFor', () => {
  it('replaces the loaded partners with the first page served when the search changes', () => {
    const start = listingOf(page(['a', 'b'], 'cursor-b'), unfiltered);
    const grown = appendPage(
      start,
      nextPageQuery(start, 'cursor-b'),
      page(['c'], 'cursor-c'),
    );

    const listing = listingFor(grown, page(['l']), lyon);

    expect(idsOf(listing.partners)).toEqual(['l']);
    expect(listing.nextCursor).toBeNull();
    expect(listing.filters).toEqual(lyon);
  });

  it('replaces the partners when only the category changes', () => {
    const listing = listingFor(
      listingOf(page(['a']), unfiltered),
      page(['r']),
      { search: '', category: 'restauration' },
    );

    expect(idsOf(listing.partners)).toEqual(['r']);
  });

  it('keeps the pages already loaded while the filters hold', () => {
    const start = listingOf(page(['a', 'b'], 'cursor-b'), lyon);
    const grown = appendPage(
      start,
      nextPageQuery(start, 'cursor-b'),
      page(['c']),
    );

    expect(listingFor(grown, page(['a', 'b'], 'cursor-b'), { ...lyon })).toBe(
      grown,
    );
  });
});

describe('appendPage', () => {
  it('appends the next page and moves the cursor forward', () => {
    const start = listingOf(page(['a', 'b'], 'cursor-b'), lyon);

    const grown = appendPage(
      start,
      nextPageQuery(start, 'cursor-b'),
      page(['c', 'd'], 'cursor-d'),
    );

    expect(idsOf(grown.partners)).toEqual(['a', 'b', 'c', 'd']);
    expect(grown.nextCursor).toBe('cursor-d');
  });

  it('drops a page requested for filters that are no longer shown, even on the same cursor', () => {
    const before = listingOf(page(['a'], 'cursor-a'), unfiltered);
    const after = listingOf(page(['a'], 'cursor-a'), lyon);

    expect(
      appendPage(after, nextPageQuery(before, 'cursor-a'), page(['b'])),
    ).toBe(after);
  });

  it('drops a page requested from a cursor the listing has already moved past', () => {
    const start = listingOf(page(['a'], 'cursor-a'), lyon);
    const query = nextPageQuery(start, 'cursor-a');
    const grown = appendPage(start, query, page(['b'], 'cursor-b'));

    expect(appendPage(grown, query, page(['b'], 'cursor-b'))).toBe(grown);
  });
});

describe('continuesListing', () => {
  it('recognises the query built for the next page of the listing', () => {
    const listing = listingOf(page(['a'], 'cursor-a'), {
      search: 'lyon',
      category: 'restauration',
    });

    expect(continuesListing(listing, nextPageQuery(listing, 'cursor-a'))).toBe(
      true,
    );
  });

  it('rejects the next page of another category', () => {
    const listing = listingOf(page(['a'], 'cursor-a'), lyon);

    expect(
      continuesListing(listing, {
        cursor: 'cursor-a',
        search: 'lyon',
        category: 'restauration',
      }),
    ).toBe(false);
  });
});

import { describe, expect, it } from 'bun:test';

import {
  filterStateOf,
  queryOf,
  sameFilters,
  withRequestedFilters,
  withUrlFilters,
} from './filters';
import {
  PARTNERS_CATEGORY_PARAM,
  PARTNERS_SEARCH_PARAM,
} from './search-params';

const unfiltered = { search: '', category: '' };

describe('withUrlFilters', () => {
  it('returns the same state while the URL still carries what it last saw', () => {
    const state = withRequestedFilters(filterStateOf(unfiltered), {
      search: 'lyon',
      category: '',
    });

    expect(withUrlFilters(state, unfiltered)).toBe(state);
  });

  it('acknowledges a requested filter once the URL carries it, without a reset', () => {
    const requested = { search: 'lyon', category: 'restauration' };
    const state = withUrlFilters(
      withRequestedFilters(filterStateOf(unfiltered), requested),
      requested,
    );

    expect(state).toEqual({ requested, seen: requested, resets: 0 });
  });

  it('adopts the URL filters and counts a reset when they change from elsewhere', () => {
    const state = withUrlFilters(
      filterStateOf({ search: 'lyon', category: 'restauration' }),
      unfiltered,
    );

    expect(state).toEqual({
      requested: unfiltered,
      seen: unfiltered,
      resets: 1,
    });
  });

  it('counts every change from elsewhere', () => {
    const once = withUrlFilters(filterStateOf(unfiltered), {
      search: 'lyon',
      category: '',
    });
    const twice = withUrlFilters(once, { search: 'paris', category: '' });

    expect(twice.resets).toBe(2);
  });
});

describe('sameFilters', () => {
  it('holds when the search and the category both match', () => {
    expect(
      sameFilters(
        { search: 'lyon', category: 'restauration' },
        { search: 'lyon', category: 'restauration' },
      ),
    ).toBe(true);
  });

  it('breaks on a different search', () => {
    expect(sameFilters({ search: 'lyon', category: '' }, unfiltered)).toBe(
      false,
    );
  });

  it('breaks on a different category', () => {
    expect(
      sameFilters({ search: '', category: 'restauration' }, unfiltered),
    ).toBe(false);
  });
});

describe('queryOf', () => {
  it('carries nothing when no filter is set', () => {
    expect(queryOf(unfiltered)).toBe('');
  });

  it('carries only the filters that are set', () => {
    const params = new URLSearchParams(
      queryOf({ search: '', category: 'culture-loisirs' }),
    );

    expect(params.has(PARTNERS_SEARCH_PARAM)).toBe(false);
    expect(params.get(PARTNERS_CATEGORY_PARAM)).toBe('culture-loisirs');
  });

  it('carries a search with accents, spaces and ampersands intact', () => {
    const params = new URLSearchParams(
      queryOf({ search: 'crêpes & café', category: 'restauration' }),
    );

    expect(params.get(PARTNERS_SEARCH_PARAM)).toBe('crêpes & café');
    expect(params.get(PARTNERS_CATEGORY_PARAM)).toBe('restauration');
  });
});

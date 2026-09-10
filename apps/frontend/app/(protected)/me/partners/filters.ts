import {
  PARTNERS_CATEGORY_PARAM,
  PARTNERS_SEARCH_PARAM,
} from './search-params';

export interface Filters {
  search: string;
  category: string;
}

/** The filters the page last requested, the ones the URL last carried, and how often the URL changed them from elsewhere. */
export interface FilterState {
  requested: Filters;
  seen: Filters;
  resets: number;
}

export function filterStateOf(filters: Filters): FilterState {
  return { requested: filters, seen: filters, resets: 0 };
}

export function sameFilters(left: Filters, right: Filters): boolean {
  return left.search === right.search && left.category === right.category;
}

export function withRequestedFilters(
  state: FilterState,
  filters: Filters,
): FilterState {
  return { ...state, requested: filters };
}

/** Folds in the URL filters: the echo of a request is acknowledged, any other change replaces the request and counts as a reset. */
export function withUrlFilters(state: FilterState, url: Filters): FilterState {
  if (sameFilters(url, state.seen)) {
    return state;
  }
  if (sameFilters(url, state.requested)) {
    return { ...state, seen: url };
  }
  return { requested: url, seen: url, resets: state.resets + 1 };
}

/** The query string carrying the filters that are set. */
export function queryOf(filters: Filters): string {
  const params = new URLSearchParams();
  if (filters.search) {
    params.set(PARTNERS_SEARCH_PARAM, filters.search);
  }
  if (filters.category) {
    params.set(PARTNERS_CATEGORY_PARAM, filters.category);
  }
  return params.toString();
}

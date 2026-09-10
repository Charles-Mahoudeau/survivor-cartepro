'use client';

import { RiSearchLine } from '@remixicon/react';
import { usePathname, useRouter } from 'next/navigation';
import { useAction } from 'next-safe-action/hooks';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Card } from '@/components/composites/card';
import { CartePartenaire } from '@/components/composites/carte-partenaire';
import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { Input } from '@/components/ui/input';
import { ME_CONTENT } from '@/content/me';
import type { PartnerPage } from '@/lib/api/schemas/backend/partner';
import type { PartnerCategory } from '@/lib/api/schemas/backend/partner-category';

import { loadMorePartnersAction } from './actions/load-more.action';
import {
  type Filters,
  filterStateOf,
  queryOf,
  withRequestedFilters,
  withUrlFilters,
} from './filters';
import {
  appendPage,
  continuesListing,
  listingFor,
  listingOf,
  nextPageQuery,
} from './listing';

const SEARCH_DEBOUNCE_MS = 300;

interface PartnersPageClientProps {
  initialPage: PartnerPage;
  categories: PartnerCategory[];
  search: string;
  category: string;
}

function SearchField({
  requested,
  onSearch,
}: {
  requested: string;
  onSearch: (search: string) => void;
}) {
  const [text, setText] = useState(requested);

  useEffect(() => {
    const search = text.trim();
    if (search === requested) {
      return;
    }
    const timer = setTimeout(() => onSearch(search), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [text, requested, onSearch]);

  return (
    <div className="relative mb-4">
      <RiSearchLine
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[color:var(--muted-foreground)]"
      />
      <Input
        id="recherche-partenaire"
        type="search"
        aria-label={ME_CONTENT.partners.searchLabel}
        placeholder={ME_CONTENT.partners.searchPlaceholder}
        className="pl-9"
        value={text}
        onChange={(event) => setText(event.target.value)}
      />
    </div>
  );
}

function CategoryChips({
  categories,
  selected,
  onSelect,
}: {
  categories: PartnerCategory[];
  selected: string;
  onSelect: (slug: string) => void;
}) {
  const chips = [
    { slug: '', label: ME_CONTENT.partners.allCategories },
    ...categories.map((category) => ({
      slug: category.slug,
      label: category.displayName,
    })),
  ];

  return (
    <ul
      className="mb-6 flex flex-wrap gap-2"
      role="group"
      aria-label="Catégories"
    >
      {chips.map(({ slug, label }) => (
        <li key={slug || 'all'}>
          <Chip pressed={slug === selected} onClick={() => onSelect(slug)}>
            {label}
          </Chip>
        </li>
      ))}
    </ul>
  );
}

export default function PartnersPageClient({
  initialPage,
  categories,
  search,
  category,
}: PartnersPageClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const urlFilters: Filters = { search, category };

  const [filterState, setFilterState] = useState(() =>
    filterStateOf(urlFilters),
  );
  const currentFilters = withUrlFilters(filterState, urlFilters);
  if (currentFilters !== filterState) {
    setFilterState(currentFilters);
  }

  const [listing, setListing] = useState(() =>
    listingOf(initialPage, urlFilters),
  );
  const currentListing = listingFor(listing, initialPage, urlFilters);
  if (currentListing !== listing) {
    setListing(currentListing);
  }

  const { execute, input, isPending } = useAction(loadMorePartnersAction, {
    onSuccess: ({ data, input: query }) => {
      setListing((current) => appendPage(current, query, data));
    },
    onError: ({ error }) => {
      toast.error(error.serverError ?? ME_CONTENT.error.body);
    },
  });

  function requestFilters(filters: Filters) {
    setFilterState((current) => withRequestedFilters(current, filters));
    const query = queryOf(filters);
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  }

  const { requested, resets } = currentFilters;
  const { partners, nextCursor } = currentListing;
  const loadingMore = isPending && continuesListing(currentListing, input);

  return (
    <>
      <SearchField
        key={resets}
        requested={requested.search}
        onSearch={(nextSearch) =>
          requestFilters({ ...requested, search: nextSearch })
        }
      />
      <CategoryChips
        categories={categories}
        selected={requested.category}
        onSelect={(slug) => requestFilters({ ...requested, category: slug })}
      />

      <p className="sr-only" aria-live="polite">
        {ME_CONTENT.partners.results(partners.length)}
      </p>

      {partners.length === 0 ? (
        <Card className="px-3 py-6">
          <p className="text-muted-foreground text-sm">
            {ME_CONTENT.partners.empty}
          </p>
        </Card>
      ) : (
        <Card className="p-2">
          <ul>
            {partners.map((partner) => (
              <CartePartenaire key={partner.id} partner={partner} />
            ))}
          </ul>
        </Card>
      )}

      {nextCursor ? (
        <div className="mt-6 text-center">
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => execute(nextPageQuery(currentListing, nextCursor))}
            disabled={loadingMore}
          >
            {loadingMore
              ? ME_CONTENT.partners.loading
              : ME_CONTENT.partners.loadMore}
          </Button>
        </div>
      ) : null}
    </>
  );
}

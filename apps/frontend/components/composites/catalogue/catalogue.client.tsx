'use client';

import { RiSearchLine } from '@remixicon/react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useAction } from 'next-safe-action/hooks';
import { useEffect, useState, useTransition } from 'react';
import { toast } from 'sonner';

import { Card } from '@/components/composites/card';
import { CartePartenaire } from '@/components/composites/carte-partenaire';
import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { Input } from '@/components/ui/input';
import { CATALOGUE_CONTENT } from '@/content/catalogue';
import type { PartnerPage } from '@/lib/api/schemas/backend/partner';
import type { PartnerCategory } from '@/lib/api/schemas/backend/partner-category';

import { loadMorePartnersAction } from './actions/load-more.action';
import {
  PARTNERS_CATEGORY_PARAM,
  PARTNERS_SEARCH_PARAM,
} from './search-params';

const SEARCH_DEBOUNCE_MS = 300;

interface CatalogueClientProps {
  initialPage: PartnerPage;
  categories: PartnerCategory[];
  search: string;
  category: string;
}

function SearchField({ value }: { value: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [text, setText] = useState(value);
  const [, startTransition] = useTransition();

  useEffect(() => {
    if (text === value) {
      return;
    }
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams);
      if (text.trim()) {
        params.set(PARTNERS_SEARCH_PARAM, text.trim());
      } else {
        params.delete(PARTNERS_SEARCH_PARAM);
      }
      const query = params.toString();
      startTransition(() => {
        router.replace(query ? `${pathname}?${query}` : pathname, {
          scroll: false,
        });
      });
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [text, value, pathname, router, searchParams]);

  return (
    <div className="relative mb-4">
      <RiSearchLine
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[color:var(--muted-foreground)]"
      />
      <Input
        id="recherche-partenaire"
        type="search"
        aria-label={CATALOGUE_CONTENT.searchLabel}
        placeholder={CATALOGUE_CONTENT.searchPlaceholder}
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
}: {
  categories: PartnerCategory[];
  selected: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function select(slug: string) {
    const params = new URLSearchParams(searchParams);
    if (slug) {
      params.set(PARTNERS_CATEGORY_PARAM, slug);
    } else {
      params.delete(PARTNERS_CATEGORY_PARAM);
    }
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  }

  const chips = [
    { slug: '', label: CATALOGUE_CONTENT.allCategories },
    ...categories.map((category) => ({
      slug: category.slug,
      label: category.displayName,
    })),
  ];

  return (
    <ul
      className="mb-6 flex flex-wrap gap-2"
      role="group"
      aria-label={CATALOGUE_CONTENT.categoriesLabel}
    >
      {chips.map(({ slug, label }) => (
        <li key={slug || 'all'}>
          <Chip pressed={slug === selected} onClick={() => select(slug)}>
            {label}
          </Chip>
        </li>
      ))}
    </ul>
  );
}

/** The searchable list of active partners, paged with a "load more" button. */
export function CatalogueClient({
  initialPage,
  categories,
  search,
  category,
}: CatalogueClientProps) {
  const [partners, setPartners] = useState(initialPage.items);
  const [nextCursor, setNextCursor] = useState(initialPage.nextCursor);

  const { execute, isPending } = useAction(loadMorePartnersAction, {
    onSuccess: ({ data }) => {
      setPartners((current) => [...current, ...data.items]);
      setNextCursor(data.nextCursor);
    },
    onError: ({ error }) => {
      toast.error(error.serverError ?? CATALOGUE_CONTENT.loadError);
    },
  });

  return (
    <>
      <SearchField key={search} value={search} />
      <CategoryChips categories={categories} selected={category} />

      <p className="sr-only" aria-live="polite">
        {CATALOGUE_CONTENT.results(partners.length)}
      </p>

      {partners.length === 0 ? (
        <Card className="px-3 py-6">
          <p className="text-muted-foreground text-sm">
            {CATALOGUE_CONTENT.empty}
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
            onClick={() =>
              execute({
                cursor: nextCursor,
                search: search || undefined,
                category: category || undefined,
              })
            }
            disabled={isPending}
          >
            {isPending ? CATALOGUE_CONTENT.loading : CATALOGUE_CONTENT.loadMore}
          </Button>
        </div>
      ) : null}
    </>
  );
}

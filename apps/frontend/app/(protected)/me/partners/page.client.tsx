'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useAction } from 'next-safe-action/hooks';
import { useEffect, useState, useTransition } from 'react';
import { toast } from 'sonner';

import { CartePartenaire } from '@/components/composites/carte-partenaire';
import { IconSearch } from '@/components/icons';
import { ME_CONTENT } from '@/content/me';
import type { PartnerPage } from '@/lib/api/schemas/backend/partner';
import type { PartnerCategory } from '@/lib/api/schemas/backend/partner-category';

import { loadMorePartnersAction } from './actions/load-more.action';
import {
  PARTNERS_CATEGORY_PARAM,
  PARTNERS_SEARCH_PARAM,
} from './search-params';

const SEARCH_DEBOUNCE_MS = 300;

interface PartnersPageClientProps {
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
    <div className="relative mb-3">
      <span
        className="absolute left-3 top-1/2 -translate-y-1/2 text-[color:var(--muted-foreground)]"
        aria-hidden="true"
      >
        <IconSearch />
      </span>
      <input
        type="search"
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder={ME_CONTENT.partners.searchPlaceholder}
        aria-label={ME_CONTENT.partners.searchLabel}
        className="w-full rounded border border-[color:var(--border)] bg-[color:var(--card)] py-2.5 pl-9 pr-4 font-serif text-sm transition-colors focus:border-[color:var(--primary)] focus:outline-none"
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
    { slug: '', label: ME_CONTENT.partners.allCategories },
    ...categories.map((category) => ({
      slug: category.slug,
      label: category.displayName,
    })),
  ];

  return (
    <div
      role="group"
      aria-label="Catégories"
      className="mb-5 flex gap-2 overflow-x-auto pb-2"
    >
      {chips.map(({ slug, label }) => {
        const active = slug === selected;
        return (
          <button
            key={slug || 'all'}
            type="button"
            aria-pressed={active}
            onClick={() => select(slug)}
            className={`shrink-0 rounded-full border px-3 py-1.5 font-display text-xs font-medium transition-colors ${
              active
                ? 'border-[color:var(--primary)] bg-[color:var(--primary)] text-white'
                : 'border-[color:var(--border)] text-[color:var(--muted-foreground)] hover:border-[color:var(--primary)] hover:text-[color:var(--primary)]'
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

export default function PartnersPageClient({
  initialPage,
  categories,
  search,
  category,
}: PartnersPageClientProps) {
  const [partners, setPartners] = useState(initialPage.items);
  const [nextCursor, setNextCursor] = useState(initialPage.nextCursor);

  const { execute, isPending } = useAction(loadMorePartnersAction, {
    onSuccess: ({ data }) => {
      setPartners((current) => [...current, ...data.items]);
      setNextCursor(data.nextCursor);
    },
    onError: ({ error }) => {
      toast.error(error.serverError ?? ME_CONTENT.error.body);
    },
  });

  return (
    <>
      <SearchField key={search} value={search} />
      <CategoryChips categories={categories} selected={category} />

      <p className="sr-only" aria-live="polite">
        {ME_CONTENT.partners.results(partners.length)}
      </p>

      <div className="space-y-2">
        {partners.length === 0 ? (
          <div className="py-12 text-center">
            <p className="font-serif text-sm text-[color:var(--muted-foreground)]">
              {ME_CONTENT.partners.empty}
            </p>
          </div>
        ) : null}
        {partners.map((partner) => (
          <CartePartenaire key={partner.id} partner={partner} />
        ))}
      </div>

      {nextCursor ? (
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() =>
              execute({
                cursor: nextCursor,
                search: search || undefined,
                category: category || undefined,
              })
            }
            disabled={isPending}
            className="inline-flex items-center justify-center gap-2 rounded border border-[color:var(--border)] bg-transparent px-4 py-2 font-display text-sm font-medium text-[color:var(--foreground)] transition-all hover:border-[color:var(--primary)] hover:text-[color:var(--primary)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending
              ? ME_CONTENT.partners.loading
              : ME_CONTENT.partners.loadMore}
          </button>
        </div>
      ) : null}
    </>
  );
}

'use client';

import { Button } from '@codegouvfr/react-dsfr/Button';
import { SearchBar } from '@codegouvfr/react-dsfr/SearchBar';
import { Tag } from '@codegouvfr/react-dsfr/Tag';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useAction } from 'next-safe-action/hooks';
import { useEffect, useState, useTransition } from 'react';
import { toast } from 'sonner';

import { CartePartenaire } from '@/components/composites/carte-partenaire';
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
    <SearchBar
      className="fr-mb-2w"
      label={ME_CONTENT.partners.searchLabel}
      onButtonClick={(submitted) => setText(submitted)}
      allowEmptySearch
      renderInput={({ className, id, placeholder, type }) => (
        <input
          className={className}
          id={id}
          type={type}
          placeholder={placeholder || ME_CONTENT.partners.searchPlaceholder}
          value={text}
          onChange={(event) => setText(event.target.value)}
        />
      )}
    />
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
    <ul className="fr-tags-group fr-mb-3w" role="group" aria-label="Catégories">
      {chips.map(({ slug, label }) => (
        <li key={slug || 'all'}>
          <Tag
            as="button"
            small
            pressed={slug === selected}
            nativeButtonProps={{ type: 'button' }}
            onClick={() => select(slug)}
          >
            {label}
          </Tag>
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
          <Button
            type="button"
            priority="secondary"
            onClick={() =>
              execute({
                cursor: nextCursor,
                search: search || undefined,
                category: category || undefined,
              })
            }
            disabled={isPending}
          >
            {isPending
              ? ME_CONTENT.partners.loading
              : ME_CONTENT.partners.loadMore}
          </Button>
        </div>
      ) : null}
    </>
  );
}

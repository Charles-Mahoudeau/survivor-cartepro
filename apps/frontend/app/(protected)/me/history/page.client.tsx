'use client';

import { useAction } from 'next-safe-action/hooks';
import { useState } from 'react';
import { toast } from 'sonner';

import { Card } from '@/components/composites/card';
import { formatDate } from '@/components/composites/date-texte';
import { MouvementLigne } from '@/components/composites/mouvement-ligne';
import { Button } from '@/components/ui/button';
import { ME_CONTENT } from '@/content/me';
import type {
  WalletEntry,
  WalletEntryPage,
} from '@/lib/api/schemas/backend/wallet-entry';

import { loadMoreWalletEntriesAction } from './actions/load-more.action';

interface HistoryPageClientProps {
  initialPage: WalletEntryPage;
}

/** Groups entries by calendar day, most recent day first, order preserved. */
export function groupByDay(
  entries: WalletEntry[],
): Array<[string, WalletEntry[]]> {
  const groups = new Map<string, WalletEntry[]>();
  for (const entry of entries) {
    const day = formatDate(entry.createdAt);
    const bucket = groups.get(day);
    if (bucket) {
      bucket.push(entry);
    } else {
      groups.set(day, [entry]);
    }
  }
  return Array.from(groups.entries());
}

export default function HistoryPageClient({
  initialPage,
}: HistoryPageClientProps) {
  const [entries, setEntries] = useState(initialPage.items);
  const [nextCursor, setNextCursor] = useState(initialPage.nextCursor);

  const { execute, isPending } = useAction(loadMoreWalletEntriesAction, {
    onSuccess: ({ data }) => {
      setEntries((current) => [...current, ...data.items]);
      setNextCursor(data.nextCursor);
    },
    onError: ({ error }) => {
      toast.error(error.serverError ?? ME_CONTENT.error.body);
    },
  });

  if (entries.length === 0) {
    return (
      <Card className="p-6">
        <p className="text-sm text-[color:var(--muted-foreground)]">
          {ME_CONTENT.history.empty}
        </p>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-5">
        {groupByDay(entries).map(([day, dayEntries]) => (
          <section key={day}>
            <h2 className="mb-2 px-1 font-display text-xs font-medium tracking-wider text-[color:var(--muted-foreground)] uppercase">
              {day}
            </h2>
            <Card>
              <ul>
                {dayEntries.map((entry, index) => (
                  <MouvementLigne
                    key={entry.id}
                    entry={entry}
                    last={index === dayEntries.length - 1}
                    variant="detail"
                  />
                ))}
              </ul>
            </Card>
          </section>
        ))}
      </div>

      {nextCursor ? (
        <div className="mt-6 text-center">
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => execute({ cursor: nextCursor })}
            disabled={isPending}
          >
            {isPending
              ? ME_CONTENT.history.loading
              : ME_CONTENT.history.loadMore}
          </Button>
        </div>
      ) : null}
    </>
  );
}

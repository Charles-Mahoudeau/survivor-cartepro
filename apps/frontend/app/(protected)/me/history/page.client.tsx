'use client';

import { useAction } from 'next-safe-action/hooks';
import { useState } from 'react';
import { toast } from 'sonner';

import { Card } from '@/components/composites/card';
import { MouvementLigne } from '@/components/composites/mouvement-ligne';
import { Button } from '@/components/ui/button';
import { ME_CONTENT } from '@/content/me';
import type { WalletEntryPage } from '@/lib/api/schemas/backend/wallet-entry';

import { loadMoreWalletEntriesAction } from './actions/load-more.action';
import { groupByDay } from './group-by-day';

interface HistoryPageClientProps {
  initialPage: WalletEntryPage;
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
      <Card className="px-3 py-6">
        <p className="text-muted-foreground text-sm">
          {ME_CONTENT.history.empty}
        </p>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {groupByDay(entries).map(([day, dayEntries]) => (
          <section key={day}>
            <h2 className="text-muted-foreground mb-2 px-3 text-xs font-medium">
              {day}
            </h2>
            <Card className="p-2">
              <ul>
                {dayEntries.map((entry) => (
                  <MouvementLigne
                    key={entry.id}
                    entry={entry}
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

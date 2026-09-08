import { RiArrowDownLine, RiArrowUpLine } from '@remixicon/react';

import { DateTexte } from '@/components/composites/date-texte';
import { Montant } from '@/components/composites/montant';
import { ME_CONTENT } from '@/content/me';
import type { WalletEntry } from '@/lib/api/schemas/backend/wallet-entry';

/** What a movement is called when the backend gives no partner or label. */
export function entryTitle(entry: WalletEntry): string {
  if (entry.label) {
    return entry.label;
  }
  switch (entry.kind) {
    case 'allocation_received':
      return ME_CONTENT.history.allocation;
    case 'refund_received':
    case 'refund_sent':
      return ME_CONTENT.history.refund;
    default:
      return ME_CONTENT.history.unknownPartner;
  }
}

interface MouvementLigneProps {
  entry: WalletEntry;
  /** `compact` is the account row, `detail` the history row. */
  variant: 'compact' | 'detail';
}

export function MouvementLigne({ entry, variant }: MouvementLigneProps) {
  const credit = entry.direction === 'credit';

  return (
    <li className="flex items-center justify-between gap-3 px-3 py-3">
      <div className="flex min-w-0 items-center gap-3">
        <span
          aria-hidden
          className="bg-muted text-muted-foreground flex size-9 shrink-0 items-center justify-center rounded-full"
        >
          {credit ? (
            <RiArrowDownLine className="size-4" />
          ) : (
            <RiArrowUpLine className="size-4" />
          )}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">
            {entry.kind === 'allocation_received' && variant === 'compact'
              ? ME_CONTENT.history.allocationShort
              : entryTitle(entry)}
          </p>
          <p className="text-muted-foreground text-xs">
            {variant === 'compact' ? (
              <DateTexte iso={entry.createdAt} format="relatif" />
            ) : (
              <>
                <DateTexte iso={entry.createdAt} format="heure" /> ·{' '}
                {credit ? ME_CONTENT.history.credit : ME_CONTENT.history.debit}
              </>
            )}
          </p>
        </div>
      </div>
      <Montant
        amount={entry.amount}
        sign={entry.direction}
        mention={false}
        className={`shrink-0 text-sm font-medium ${
          credit ? 'text-emerald-dark' : 'text-foreground'
        }`}
      />
    </li>
  );
}

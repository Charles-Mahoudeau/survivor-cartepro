import { DateTexte } from '@/components/composites/date-texte';
import { Montant } from '@/components/composites/montant';
import { IconArrowDown, IconArrowUp } from '@/components/icons';
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

const CREDIT_BUBBLE = 'bg-[#D1FAE5] text-[#065F46]';
const DEBIT_BUBBLE = 'bg-[#EEF1F7] text-[color:var(--primary)]';

interface MouvementLigneProps {
  entry: WalletEntry;
  last: boolean;
  /** `compact` is the dashboard row, `detail` the history row. */
  variant: 'compact' | 'detail';
}

export function MouvementLigne({ entry, last, variant }: MouvementLigneProps) {
  const credit = entry.direction === 'credit';
  const bubble = credit ? CREDIT_BUBBLE : DEBIT_BUBBLE;

  return (
    <li
      className={`flex items-center justify-between px-4 py-3.5 ${
        last ? '' : 'border-b border-[color:var(--border)]'
      }`}
    >
      <div className="flex items-center gap-3">
        {variant === 'compact' ? (
          <div
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs ${bubble}`}
            aria-hidden="true"
          >
            {credit ? '+' : '−'}
          </div>
        ) : (
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${bubble}`}
            aria-hidden="true"
          >
            {credit ? <IconArrowDown /> : <IconArrowUp />}
          </div>
        )}
        <div>
          <div className="font-display text-sm font-medium text-[color:var(--foreground)]">
            {entry.kind === 'allocation_received' && variant === 'compact'
              ? ME_CONTENT.history.allocationShort
              : entryTitle(entry)}
          </div>
          <div className="font-serif text-xs text-[color:var(--muted-foreground)]">
            {variant === 'compact' ? (
              <DateTexte iso={entry.createdAt} format="relatif" />
            ) : (
              <>
                <DateTexte iso={entry.createdAt} format="heure" /> ·{' '}
                {credit ? ME_CONTENT.history.credit : ME_CONTENT.history.debit}
              </>
            )}
          </div>
        </div>
      </div>
      <Montant
        amount={entry.amount}
        sign={entry.direction}
        mention={false}
        className={`text-sm ${variant === 'compact' ? 'font-medium' : 'font-semibold'} ${
          credit ? 'text-[#065F46]' : 'text-[color:var(--foreground)]'
        }`}
      />
    </li>
  );
}

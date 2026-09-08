import { formatDate } from '@/components/composites/date-texte';
import type { WalletEntry } from '@/lib/api/schemas/backend/wallet-entry';

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

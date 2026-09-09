import {
  computeChainHash,
  type ChainHashFields,
} from '@/modules/audit/services/helpers/chain-hash.helper';

export interface ChainEntry extends ChainHashFields {
  id: string;
  hash: string;
}

export type ChainAnomaly =
  /** This row's own fields no longer hash to what is stored — it was edited. */
  | { type: 'tampered'; id: string; index: number }
  /**
   * This row's own content is intact, but its `previousHash` no longer
   * matches the hash of whatever now sits immediately before it — a row
   * that used to be there is gone.
   */
  | { type: 'missing_link'; id: string; index: number };

export interface ChainVerificationResult {
  ok: boolean;
  checked: number;
  anomalies: ChainAnomaly[];
}

/**
 * Walks the chain oldest-first and reports where it breaks, distinguishing
 * two signatures on purpose (see the integrity note): a content edit fails
 * the row's own hash, a deletion leaves every row's own hash intact but
 * breaks the link into the row that follows the gap. A row can report at
 * most one anomaly — once its own hash is wrong there is nothing more
 * reliable left to say about its link to what precedes it.
 *
 * `expectedFirstPreviousHash` is what the very first entry's `previousHash`
 * must equal — `null` (the default) when `entries` is expected to start at
 * the chain's true origin. A signed export of one period cannot prove what
 * came before its own first row without the database, so the export
 * verifier passes that row's own `previousHash` back in here: it trusts the
 * boundary the signature already vouches for, and this function then checks
 * only the links it actually can — every row after the first.
 */
export function verifyChain(
  entries: readonly ChainEntry[],
  expectedFirstPreviousHash: string | null = null,
): ChainVerificationResult {
  const anomalies: ChainAnomaly[] = [];

  for (let index = 0; index < entries.length; index += 1) {
    const entry = entries[index];
    const recomputedHash = computeChainHash(entry);

    if (recomputedHash !== entry.hash) {
      anomalies.push({ type: 'tampered', id: entry.id, index });
      continue;
    }

    const expectedPreviousHash =
      index === 0 ? expectedFirstPreviousHash : entries[index - 1].hash;
    if (entry.previousHash !== expectedPreviousHash) {
      anomalies.push({ type: 'missing_link', id: entry.id, index });
    }
  }

  return { ok: anomalies.length === 0, checked: entries.length, anomalies };
}

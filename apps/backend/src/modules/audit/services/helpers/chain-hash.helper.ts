import { createHash } from 'node:crypto';
import { AuditAction } from '@/modules/audit/enums/audit-action.enum';

export interface ChainHashFields {
  actorId: string | null;
  actorRole: string | null;
  action: AuditAction;
  targetType: string;
  targetId: string | null;
  payload: Record<string, unknown> | null;
  ip: string | null;
  previousHash: string | null;
}

const FIELD_DELIMITER = '|';

/**
 * Deep-sorts object keys so `JSON.stringify` stops being sensitive to key
 * order. Required because Postgres's `jsonb` column does not preserve the
 * order a payload's keys were written in — it stores them by its own
 * internal ordering — so a value read back can serialize differently from
 * the same value at write time even though nothing in it changed. Array
 * order is left alone: it is significant, unlike object key order.
 */
function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(canonicalize);
  }
  if (value !== null && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    const sorted: Record<string, unknown> = {};
    for (const key of Object.keys(record).sort()) {
      sorted[key] = canonicalize(record[key]);
    }
    return sorted;
  }
  return value;
}

/**
 * SHA-256 over this record's own fields, chained to `previousHash`.
 *
 * Deliberately excludes `id` and `occurredAt`: both are assigned by the
 * database at insert time, after this hash must already be known, so the
 * chain vouches for who did what to what — not for a storage-assigned
 * timestamp or identifier.
 */
export function computeChainHash(fields: ChainHashFields): string {
  const serialized = [
    fields.actorId ?? '',
    fields.actorRole ?? '',
    fields.action,
    fields.targetType,
    fields.targetId ?? '',
    JSON.stringify(canonicalize(fields.payload ?? null)),
    fields.ip ?? '',
    fields.previousHash ?? '',
  ].join(FIELD_DELIMITER);

  return createHash('sha256').update(serialized).digest('hex');
}

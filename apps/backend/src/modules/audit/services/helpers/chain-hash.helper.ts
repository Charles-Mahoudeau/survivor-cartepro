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
    JSON.stringify(fields.payload ?? null),
    fields.ip ?? '',
    fields.previousHash ?? '',
  ].join(FIELD_DELIMITER);

  return createHash('sha256').update(serialized).digest('hex');
}

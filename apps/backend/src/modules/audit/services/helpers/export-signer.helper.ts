import { createHmac, timingSafeEqual } from 'node:crypto';
import { canonicalize } from '@/modules/audit/services/helpers/chain-hash.helper';
import type { ChainEntry } from '@/modules/audit/services/helpers/chain-verifier.helper';

export interface ExportedAuditEntry extends ChainEntry {
  occurredAt: string;
}

export interface AuditExportPayload {
  period: { from: string; to: string | null };
  entries: ExportedAuditEntry[];
  /**
   * The last entry's own hash, or null when the period holds nothing — a
   * compact fingerprint of the chain as of this export, meant to be read
   * and compared by a human without re-deriving it.
   */
  chainDigest: string | null;
}

export interface SignedAuditExport extends AuditExportPayload {
  signature: string;
}

/** What actually gets signed: canonical so key order never affects it. */
function canonicalPayloadString(payload: AuditExportPayload): string {
  return JSON.stringify(canonicalize(payload));
}

export function signAuditExport(
  payload: AuditExportPayload,
  secret: string,
): SignedAuditExport {
  const signature = createHmac('sha256', secret)
    .update(canonicalPayloadString(payload))
    .digest('hex');

  return { ...payload, signature };
}

/**
 * True only if the export was signed with this exact secret and nothing in
 * it — not one entry, not the digest, not the period — changed since.
 */
export function verifyAuditExportSignature(
  signed: SignedAuditExport,
  secret: string,
): boolean {
  const { signature, ...payload } = signed;
  const expected = createHmac('sha256', secret)
    .update(canonicalPayloadString(payload))
    .digest('hex');

  const provided = Buffer.from(signature, 'hex');
  const expectedBuffer = Buffer.from(expected, 'hex');

  return (
    provided.length === expectedBuffer.length &&
    timingSafeEqual(provided, expectedBuffer)
  );
}

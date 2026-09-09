import { describe, expect, it } from '@jest/globals';
import {
  signAuditExport,
  verifyAuditExportSignature,
  type AuditExportPayload,
} from '@/modules/audit/services/helpers/export-signer.helper';
import { AuditAction } from '@/modules/audit/enums/audit-action.enum';

const SECRET_A = 'a-secret-at-least-thirty-two-characters-long';
const SECRET_B = 'a-different-secret-of-the-same-length-here!';

const BASE_PAYLOAD: AuditExportPayload = {
  period: { from: '2026-09-01T00:00:00.000Z', to: '2026-09-08T00:00:00.000Z' },
  entries: [
    {
      id: 'entry-0',
      actorId: null,
      actorRole: null,
      action: AuditAction.PARTNER_APPROVED,
      targetType: 'partner',
      targetId: 'p-1',
      payload: { reason: 'complete' },
      ip: '203.0.113.7',
      previousHash: null,
      hash: 'a'.repeat(64),
      occurredAt: '2026-09-01T10:00:00.000Z',
    },
  ],
  chainDigest: 'a'.repeat(64),
};

describe('signAuditExport / verifyAuditExportSignature', () => {
  it('verifies a signature produced with the same secret', () => {
    const signed = signAuditExport(BASE_PAYLOAD, SECRET_A);

    expect(verifyAuditExportSignature(signed, SECRET_A)).toBe(true);
  });

  it('rejects a signature checked against the wrong secret', () => {
    const signed = signAuditExport(BASE_PAYLOAD, SECRET_A);

    expect(verifyAuditExportSignature(signed, SECRET_B)).toBe(false);
  });

  it('rejects a payload edited after signing', () => {
    const signed = signAuditExport(BASE_PAYLOAD, SECRET_A);
    const tampered = {
      ...signed,
      entries: [{ ...signed.entries[0], targetId: 'forged' }],
    };

    expect(verifyAuditExportSignature(tampered, SECRET_A)).toBe(false);
  });

  it('rejects a chainDigest edited after signing, even with every entry intact', () => {
    const signed = signAuditExport(BASE_PAYLOAD, SECRET_A);
    const tampered = { ...signed, chainDigest: 'b'.repeat(64) };

    expect(verifyAuditExportSignature(tampered, SECRET_A)).toBe(false);
  });

  it('rejects a period edited after signing', () => {
    const signed = signAuditExport(BASE_PAYLOAD, SECRET_A);
    const tampered = {
      ...signed,
      period: { ...signed.period, to: '2026-12-31T00:00:00.000Z' },
    };

    expect(verifyAuditExportSignature(tampered, SECRET_A)).toBe(false);
  });

  it('is unaffected by the key order the payload is serialized in', () => {
    const signed = signAuditExport(BASE_PAYLOAD, SECRET_A);
    // The same payload, rebuilt with every object's keys in reverse order.
    const reordered = {
      ...signed,
      entries: signed.entries.map((entry) => ({
        hash: entry.hash,
        previousHash: entry.previousHash,
        ip: entry.ip,
        payload: entry.payload,
        targetId: entry.targetId,
        targetType: entry.targetType,
        action: entry.action,
        actorRole: entry.actorRole,
        actorId: entry.actorId,
        occurredAt: entry.occurredAt,
        id: entry.id,
      })),
    };

    expect(verifyAuditExportSignature(reordered, SECRET_A)).toBe(true);
  });

  it('verifies an export whose period holds no entries', () => {
    const empty: AuditExportPayload = {
      period: { from: '2026-09-01T00:00:00.000Z', to: null },
      entries: [],
      chainDigest: null,
    };

    const signed = signAuditExport(empty, SECRET_A);

    expect(verifyAuditExportSignature(signed, SECRET_A)).toBe(true);
  });
});

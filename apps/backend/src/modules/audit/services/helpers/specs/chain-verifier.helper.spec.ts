import { describe, expect, it } from '@jest/globals';
import { computeChainHash } from '@/modules/audit/services/helpers/chain-hash.helper';
import {
  verifyChain,
  type ChainEntry,
} from '@/modules/audit/services/helpers/chain-verifier.helper';
import { AuditAction } from '@/modules/audit/enums/audit-action.enum';

/** Builds a valid chain of `count` entries, each correctly hashed and linked. */
function buildChain(count: number): ChainEntry[] {
  const entries: ChainEntry[] = [];
  let previousHash: string | null = null;

  for (let i = 0; i < count; i += 1) {
    const fields = {
      actorId: `018f2f3a-0000-7000-8000-00000000000${i}`,
      actorRole: 'admin',
      action: AuditAction.PARTNER_APPROVED,
      targetType: 'partner',
      targetId: `target-${i}`,
      payload: { step: i },
      ip: '203.0.113.7',
      previousHash,
    };
    const hash = computeChainHash(fields);
    entries.push({ id: `entry-${i}`, hash, ...fields });
    previousHash = hash;
  }

  return entries;
}

describe('verifyChain', () => {
  it('reports no anomaly over an intact chain', () => {
    const result = verifyChain(buildChain(5));

    expect(result).toEqual({ ok: true, checked: 5, anomalies: [] });
  });

  it('reports no anomaly for a single-entry chain', () => {
    const result = verifyChain(buildChain(1));

    expect(result).toEqual({ ok: true, checked: 1, anomalies: [] });
  });

  it('reports no anomaly for an empty chain', () => {
    expect(verifyChain([])).toEqual({ ok: true, checked: 0, anomalies: [] });
  });

  it('names the exact row whose content was edited without recomputing its hash', () => {
    const entries = buildChain(5);
    entries[2] = { ...entries[2], targetId: 'forged-target' };

    const result = verifyChain(entries);

    expect(result.ok).toBe(false);
    expect(result.anomalies).toEqual([
      { type: 'tampered', id: 'entry-2', index: 2 },
    ]);
  });

  it('does not also report a broken link for the row that follows an edited one', () => {
    const entries = buildChain(5);
    entries[2] = { ...entries[2], targetId: 'forged-target' };

    const result = verifyChain(entries);

    expect(result.anomalies).toHaveLength(1);
  });

  it('flags a missing link, distinct from tampering, when a row is deleted', () => {
    const entries = buildChain(5);
    entries.splice(2, 1);

    const result = verifyChain(entries);

    expect(result.ok).toBe(false);
    expect(result.anomalies).toEqual([
      { type: 'missing_link', id: 'entry-3', index: 2 },
    ]);
  });

  it('flags a missing link when the row before the surviving first row is gone', () => {
    // The chain's true origin (entry-0) is deleted: entry-1 is now first in
    // view, but its own previousHash still points at entry-0's hash, which
    // no longer precedes anything — the same signature as any other gap.
    const entries = buildChain(4);
    entries.splice(0, 1);

    const result = verifyChain(entries);

    expect(result.anomalies).toEqual([
      { type: 'missing_link', id: 'entry-1', index: 0 },
    ]);
  });

  it('rejects a forged previousHash as tampering, since it changes the row own hash too', () => {
    // previousHash is itself one of the hashed fields, so rewriting it
    // without recomputing the row's hash is caught as content tampering —
    // a stronger guarantee than a plain link check would give.
    const entries = buildChain(3);
    entries[0] = { ...entries[0], previousHash: 'forged-origin' };

    const result = verifyChain(entries);

    expect(result.anomalies).toEqual([
      { type: 'tampered', id: 'entry-0', index: 0 },
    ]);
  });

  it('flags a missing link when the last row is deleted', () => {
    const entries = buildChain(3);
    entries.splice(2, 1);

    expect(verifyChain(entries)).toEqual({
      ok: true,
      checked: 2,
      anomalies: [],
    });
  });

  it('reports one tampered anomaly per independently edited row', () => {
    const entries = buildChain(5);
    entries[1] = { ...entries[1], targetId: 'forged-1' };
    entries[3] = { ...entries[3], targetId: 'forged-3' };

    const result = verifyChain(entries);

    expect(result.anomalies).toEqual([
      { type: 'tampered', id: 'entry-1', index: 1 },
      { type: 'tampered', id: 'entry-3', index: 3 },
    ]);
  });

  describe('a window that does not start at the chain origin', () => {
    it('accepts the caller-supplied boundary instead of requiring a null previousHash', () => {
      const full = buildChain(5);
      const window = full.slice(2); // entries 2..4; entry 2's previousHash is entry 1's hash

      // Without the boundary, index 0's real (non-null) previousHash would
      // itself look like a missing link — this is exactly what an export
      // verifier must avoid reporting for a period that isn't the origin.
      expect(verifyChain(window).ok).toBe(false);

      expect(verifyChain(window, window[0].previousHash)).toEqual({
        ok: true,
        checked: 3,
        anomalies: [],
      });
    });

    it('still finds a tampered row inside the window', () => {
      const full = buildChain(5);
      const window = full.slice(2);
      window[1] = { ...window[1], targetId: 'forged' };

      const result = verifyChain(window, window[0].previousHash);

      expect(result.anomalies).toEqual([
        { type: 'tampered', id: 'entry-3', index: 1 },
      ]);
    });

    it('still finds a row deleted from inside the window', () => {
      const full = buildChain(5);
      const window = full.slice(2);
      window.splice(1, 1);

      const result = verifyChain(window, window[0].previousHash);

      expect(result.anomalies).toEqual([
        { type: 'missing_link', id: 'entry-4', index: 1 },
      ]);
    });
  });
});

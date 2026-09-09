import { describe, expect, it } from '@jest/globals';
import {
  computeChainHash,
  type ChainHashFields,
} from '@/modules/audit/services/helpers/chain-hash.helper';
import { AuditAction } from '@/modules/audit/enums/audit-action.enum';

const BASE_FIELDS: ChainHashFields = {
  actorId: '018f2f3a-1111-7000-8000-000000000001',
  actorRole: 'admin',
  action: AuditAction.PARTNER_APPROVED,
  targetType: 'partner',
  targetId: '018f2f3a-2222-7000-8000-000000000002',
  payload: { reason: 'complete dossier' },
  ip: '203.0.113.7',
  previousHash: 'aaaa',
};

describe('computeChainHash', () => {
  it('is deterministic for identical fields', () => {
    expect(computeChainHash(BASE_FIELDS)).toBe(computeChainHash(BASE_FIELDS));
  });

  it('produces a 64-character lowercase hex digest', () => {
    expect(computeChainHash(BASE_FIELDS)).toMatch(/^[0-9a-f]{64}$/);
  });

  it('changes when previousHash changes, all else equal', () => {
    const other = computeChainHash({ ...BASE_FIELDS, previousHash: 'bbbb' });
    expect(other).not.toBe(computeChainHash(BASE_FIELDS));
  });

  it('changes when the action changes, all else equal', () => {
    const other = computeChainHash({
      ...BASE_FIELDS,
      action: AuditAction.PARTNER_REFUSED,
    });
    expect(other).not.toBe(computeChainHash(BASE_FIELDS));
  });

  it('changes when the target id changes, all else equal', () => {
    const other = computeChainHash({ ...BASE_FIELDS, targetId: 'different' });
    expect(other).not.toBe(computeChainHash(BASE_FIELDS));
  });

  it('changes when the payload changes, all else equal', () => {
    const other = computeChainHash({
      ...BASE_FIELDS,
      payload: { reason: 'incomplete dossier' },
    });
    expect(other).not.toBe(computeChainHash(BASE_FIELDS));
  });

  it('distinguishes a null payload from an empty object payload', () => {
    const withNull = computeChainHash({ ...BASE_FIELDS, payload: null });
    const withEmpty = computeChainHash({ ...BASE_FIELDS, payload: {} });
    expect(withNull).not.toBe(withEmpty);
  });

  it('treats a null previousHash as the chain origin, distinct from any real hash', () => {
    const origin = computeChainHash({ ...BASE_FIELDS, previousHash: null });
    expect(origin).not.toBe(computeChainHash(BASE_FIELDS));
  });

  it('does not collide when a field boundary shifts across the delimiter', () => {
    // "a|b" split as actorRole vs targetType could otherwise match "a" + "|b"
    // split differently — proves the fields aren't just naively concatenated.
    const first = computeChainHash({
      ...BASE_FIELDS,
      actorRole: 'a',
      targetType: 'b|c',
    });
    const second = computeChainHash({
      ...BASE_FIELDS,
      actorRole: 'a|b',
      targetType: 'c',
    });
    expect(first).not.toBe(second);
  });

  it('handles every optional field left null', () => {
    const allNull: ChainHashFields = {
      actorId: null,
      actorRole: null,
      action: AuditAction.LOGIN_FAILED,
      targetType: 'session',
      targetId: null,
      payload: null,
      ip: null,
      previousHash: null,
    };
    expect(computeChainHash(allNull)).toMatch(/^[0-9a-f]{64}$/);
  });

  it('is unaffected by the key order of the payload object', () => {
    // Postgres's jsonb column does not preserve the key order a payload was
    // written in, so the hash must not depend on it either — otherwise a row
    // read back from the database would always look tampered.
    const inOneOrder = computeChainHash({
      ...BASE_FIELDS,
      payload: { event: 'chain_origin', note: 'x' },
    });
    const inTheOtherOrder = computeChainHash({
      ...BASE_FIELDS,
      payload: { note: 'x', event: 'chain_origin' },
    });
    expect(inOneOrder).toBe(inTheOtherOrder);
  });

  it('is unaffected by key order inside a nested payload object', () => {
    const inOneOrder = computeChainHash({
      ...BASE_FIELDS,
      payload: { outer: { a: 1, b: 2 } },
    });
    const inTheOtherOrder = computeChainHash({
      ...BASE_FIELDS,
      payload: { outer: { b: 2, a: 1 } },
    });
    expect(inOneOrder).toBe(inTheOtherOrder);
  });

  it('still distinguishes payloads that only differ by a nested value', () => {
    const first = computeChainHash({
      ...BASE_FIELDS,
      payload: { outer: { a: 1, b: 2 } },
    });
    const second = computeChainHash({
      ...BASE_FIELDS,
      payload: { outer: { a: 1, b: 3 } },
    });
    expect(first).not.toBe(second);
  });

  it('keeps array order significant, unlike object key order', () => {
    const first = computeChainHash({
      ...BASE_FIELDS,
      payload: { items: [1, 2, 3] },
    });
    const second = computeChainHash({
      ...BASE_FIELDS,
      payload: { items: [3, 2, 1] },
    });
    expect(first).not.toBe(second);
  });
});

import { redact } from '../redact.util';
import {
  REDACTED_PLACEHOLDER,
  TRUNCATED_PLACEHOLDER,
} from '../../constants/logging.constants';

describe('redact', () => {
  it('masks a denylisted key whatever its spelling', () => {
    expect(
      redact({ accessToken: 'a', access_token: 'b', 'Access-Token': 'c' }),
    ).toEqual({
      accessToken: REDACTED_PLACEHOLDER,
      access_token: REDACTED_PLACEHOLDER,
      'Access-Token': REDACTED_PLACEHOLDER,
    });
  });

  it('masks the payment QR, which is a replayable bearer credential', () => {
    expect(redact({ qrPayload: 'eyJ...', nonce: 'abc' })).toEqual({
      qrPayload: REDACTED_PLACEHOLDER,
      nonce: REDACTED_PLACEHOLDER,
    });
  });

  it('masks monetary values', () => {
    expect(redact({ amount: 1250, balance: 8000, solde: 42 })).toEqual({
      amount: REDACTED_PLACEHOLDER,
      balance: REDACTED_PLACEHOLDER,
      solde: REDACTED_PLACEHOLDER,
    });
  });

  it('leaves identifiers readable, which is what keeps a log correlatable', () => {
    const input = { transactionId: 'tx_1', partnerId: 'p_2', id: 'i_3' };
    expect(redact(input)).toEqual(input);
  });

  it('matches on the exact key, never on a substring', () => {
    // `translation` contains `lat`, `credited` contains `credit`: a substring
    // test here would blank ordinary fields and nobody would notice.
    const input = { translation: 'fr', credited: true, tokenizer: 'v1' };
    expect(redact(input)).toEqual(input);
  });

  it('does not mutate its input', () => {
    const input = { password: 'hunter2', nested: { email: 'a@b.c' } };
    redact(input);
    expect(input.password).toBe('hunter2');
    expect(input.nested.email).toBe('a@b.c');
  });

  it('descends into arrays and nested objects', () => {
    expect(redact({ users: [{ email: 'a@b.c', role: 'employee' }] })).toEqual({
      users: [{ email: REDACTED_PLACEHOLDER, role: 'employee' }],
    });
  });

  it('truncates past the depth bound, terminating a cycle', () => {
    const cyclic: Record<string, unknown> = { name: 'root' };
    cyclic.self = cyclic;

    expect(() => JSON.stringify(redact(cyclic))).not.toThrow();
    expect(JSON.stringify(redact(cyclic))).toContain(TRUNCATED_PLACEHOLDER);
  });

  it('passes primitives through untouched', () => {
    expect(redact('plain')).toBe('plain');
    expect(redact(42)).toBe(42);
    expect(redact(null)).toBeNull();
  });
});

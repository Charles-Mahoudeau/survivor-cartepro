import { SHORT_CODE_ALPHABET } from '../../../constants/payment-token.constants';
import {
  ShortCodeExhaustedError,
  generateShortCode,
  generateUniqueShortCode,
} from '../short-code.helper';

const ALPHABET_SET = new Set(SHORT_CODE_ALPHABET);

describe('generateShortCode', () => {
  it('draws eight characters', () => {
    expect(generateShortCode()).toHaveLength(8);
  });

  it('only draws from the declared alphabet', () => {
    for (let i = 0; i < 1000; i++) {
      for (const char of generateShortCode()) {
        expect(ALPHABET_SET.has(char)).toBe(true);
      }
    }
  });

  it('covers every symbol of the alphabet across many draws', () => {
    const seen = new Set<string>();
    for (let i = 0; i < 10_000; i++) {
      for (const char of generateShortCode()) {
        seen.add(char);
      }
    }
    expect(seen.size).toBe(SHORT_CODE_ALPHABET.length);
  });

  it('does not collide across a thousand draws', () => {
    const codes = new Set<string>();
    for (let i = 0; i < 1000; i++) {
      codes.add(generateShortCode());
    }
    expect(codes.size).toBe(1000);
  });
});

describe('generateUniqueShortCode', () => {
  it('returns the first draw when it is not taken', async () => {
    const calls: string[] = [];
    const isTaken = (code: string) => {
      calls.push(code);
      return false;
    };

    const code = await generateUniqueShortCode(isTaken);

    expect(code).toHaveLength(8);
    expect(calls).toHaveLength(1);
  });

  it('retries once on a simulated collision, then accepts the next draw', async () => {
    const calls: string[] = [];
    const isTaken = (code: string) => {
      calls.push(code);
      return calls.length === 1;
    };

    const code = await generateUniqueShortCode(isTaken);

    expect(code).toHaveLength(8);
    expect(calls).toHaveLength(2);
    expect(code).toBe(calls[1]);
  });

  it('awaits an async predicate', async () => {
    const calls: string[] = [];
    const isTaken = (code: string) => {
      calls.push(code);
      return Promise.resolve(calls.length === 1);
    };

    const code = await generateUniqueShortCode(isTaken);

    expect(code).toHaveLength(8);
    expect(calls).toHaveLength(2);
  });

  it('gives up after five attempts and throws ShortCodeExhaustedError', async () => {
    const calls: string[] = [];
    const isTaken = (code: string) => {
      calls.push(code);
      return true;
    };

    await expect(generateUniqueShortCode(isTaken)).rejects.toThrow(
      ShortCodeExhaustedError,
    );
    expect(calls).toHaveLength(5);
  });
});

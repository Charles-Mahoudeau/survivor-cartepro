import { randomInt } from 'node:crypto';
import {
  SHORT_CODE_ALPHABET,
  SHORT_CODE_LENGTH,
  SHORT_CODE_MAX_ATTEMPTS,
} from '../../constants/payment-token.constants';

export class ShortCodeExhaustedError extends Error {
  constructor(attempts: number) {
    super(`No unique short code found after ${attempts} attempts`);
    this.name = 'ShortCodeExhaustedError';
  }
}

/** Draws one short code from the alphabet using a CSPRNG. */
export function generateShortCode(): string {
  return Array.from(
    { length: SHORT_CODE_LENGTH },
    () => SHORT_CODE_ALPHABET[randomInt(SHORT_CODE_ALPHABET.length)],
  ).join('');
}

/**
 * Draws short codes until `isTaken` accepts one, retrying on collision up to
 * SHORT_CODE_MAX_ATTEMPTS times before giving up.
 */
export async function generateUniqueShortCode(
  isTaken: (code: string) => boolean | Promise<boolean>,
): Promise<string> {
  for (let attempt = 1; attempt <= SHORT_CODE_MAX_ATTEMPTS; attempt++) {
    const code = generateShortCode();
    if (!(await isTaken(code))) {
      return code;
    }
  }
  throw new ShortCodeExhaustedError(SHORT_CODE_MAX_ATTEMPTS);
}

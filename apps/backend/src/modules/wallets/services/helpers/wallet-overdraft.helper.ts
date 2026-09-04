import { WALLET_OVERDRAFT_LIMIT } from '../../constants';

const CENTS_PER_EURO = 100;

/** Two-decimal amounts compared as floats drift right at the boundary. */
function toCents(euros: number): number {
  return Math.round(euros * CENTS_PER_EURO);
}

/**
 * Whether a wallet holding `balance` may pay `amount`, both in euros. The
 * limit is inclusive: a balance landing exactly on it is still allowed.
 */
export function isDebitAllowed(balance: number, amount: number): boolean {
  return toCents(balance) - toCents(amount) >= -toCents(WALLET_OVERDRAFT_LIMIT);
}

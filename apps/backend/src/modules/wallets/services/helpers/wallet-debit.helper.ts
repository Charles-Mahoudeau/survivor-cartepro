import { toCents } from '@/common/money';

/**
 * Whether a wallet holding `balance` may pay `amount`, both in euros. A debit
 * that would leave the balance negative is refused; landing exactly on zero
 * is allowed.
 */
export function isDebitAllowed(balance: number, amount: number): boolean {
  return toCents(balance) - toCents(amount) >= 0;
}

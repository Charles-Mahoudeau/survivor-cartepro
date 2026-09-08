import { toCents } from '@/common/money';
import { WALLET_OVERDRAFT_LIMIT } from '../../constants';

/**
 * Whether a wallet holding `balance` may pay `amount`, both in euros. The
 * limit is inclusive: a balance landing exactly on it is still allowed.
 */
export function isDebitAllowed(balance: number, amount: number): boolean {
  return toCents(balance) - toCents(amount) >= -toCents(WALLET_OVERDRAFT_LIMIT);
}

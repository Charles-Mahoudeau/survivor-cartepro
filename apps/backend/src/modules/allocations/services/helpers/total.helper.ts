import { toCents, toEuros } from '@/common/money';

/**
 * What an allocation of `amount` euros credits in total to `beneficiaries`
 * wallets.
 */
export function totalCredited(amount: string, beneficiaries: number): string {
  return toEuros(toCents(Number(amount)) * beneficiaries);
}

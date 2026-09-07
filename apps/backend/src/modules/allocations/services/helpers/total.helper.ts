const CENTS_PER_EURO = 100;

/**
 * What an allocation of `amount` euros credits in total to `beneficiaries`
 * wallets. Multiplying euros as floats drifts on the second decimal.
 */
export function totalCredited(amount: string, beneficiaries: number): string {
  const cents = Math.round(Number(amount) * CENTS_PER_EURO) * beneficiaries;
  return (cents / CENTS_PER_EURO).toFixed(2);
}

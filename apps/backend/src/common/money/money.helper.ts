const CENTS_PER_EURO = 100;

/** Euros to cents, because two-decimal amounts drift when added as floats. */
export function toCents(euros: number): number {
  return Math.round(euros * CENTS_PER_EURO);
}

/** Cents back to the two-decimal euro string the API puts on the wire. */
export function toEuros(cents: number): string {
  return (cents / CENTS_PER_EURO).toFixed(2);
}

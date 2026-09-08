/**
 * Luhn checksum used for a French SIREN. Callers are responsible for the
 * 9-digit format check first — a non-digit character makes a term `NaN`,
 * which safely fails the modulo check below rather than throwing.
 */
export function isValidSirenChecksum(siren: string): boolean {
  let sum = 0;

  for (let i = 0; i < siren.length; i++) {
    let digit = Number(siren[siren.length - 1 - i]);

    if (i % 2 === 1) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
  }

  return sum % 10 === 0;
}

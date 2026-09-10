/** A SIREN has nine digits. */
export const SIREN_LENGTH = 9;

const SIREN_FORMAT = new RegExp(`^\\d{${SIREN_LENGTH}}$`);
const LUHN_MODULUS = 10;
const LUHN_DOUBLED_CEILING = 9;

/** Drops the spaces a SIREN is often written with, as in « 552 100 554 ». */
export function normalizeSiren(value: string): string {
  return value.replace(/\s+/g, '');
}

/** Whether a string is exactly nine digits, checksum aside. */
export function hasSirenFormat(value: string): boolean {
  return SIREN_FORMAT.test(value);
}

/** Whether a string is nine digits whose Luhn checksum holds, as the backend checks it. */
export function isValidSiren(value: string): boolean {
  if (!hasSirenFormat(value)) {
    return false;
  }

  let sum = 0;

  for (let index = 0; index < value.length; index++) {
    let digit = Number(value[value.length - 1 - index]);

    if (index % 2 === 1) {
      digit *= 2;
      if (digit > LUHN_DOUBLED_CEILING) {
        digit -= LUHN_DOUBLED_CEILING;
      }
    }

    sum += digit;
  }

  return sum % LUHN_MODULUS === 0;
}

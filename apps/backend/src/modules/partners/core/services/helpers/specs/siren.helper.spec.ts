import { describe, expect, it } from '@jest/globals';
import { isValidSirenChecksum } from '../siren.helper';

describe('isValidSirenChecksum', () => {
  it('accepts a real SIREN with a valid Luhn checksum', () => {
    expect(isValidSirenChecksum('552100554')).toBe(true);
    expect(isValidSirenChecksum('652014051')).toBe(true);
  });

  it('rejects a 9-digit string with an invalid checksum', () => {
    expect(isValidSirenChecksum('123456789')).toBe(false);
  });

  it('rejects a non-numeric input instead of throwing', () => {
    expect(isValidSirenChecksum('55210055A')).toBe(false);
  });
});

import { describe, expect, it } from 'bun:test';

import { hasSirenFormat, isValidSiren, normalizeSiren } from './siren';

describe('isValidSiren', () => {
  it('accepts nine digits whose Luhn checksum holds', () => {
    expect(isValidSiren('552100554')).toBe(true);
    expect(isValidSiren('552081317')).toBe(true);
    expect(isValidSiren('732829320')).toBe(true);
  });

  it('refuses nine digits whose checksum fails, as the backend does', () => {
    expect(isValidSiren('552100555')).toBe(false);
    expect(isValidSiren('732829321')).toBe(false);
  });

  it('refuses another length even when the checksum would hold', () => {
    expect(isValidSiren('0552100554')).toBe(false);
    expect(isValidSiren('57100554')).toBe(false);
  });

  it('refuses letters, separators and the empty string', () => {
    expect(isValidSiren('55210055A')).toBe(false);
    expect(isValidSiren('552 100 554')).toBe(false);
    expect(isValidSiren('552-100-554')).toBe(false);
    expect(isValidSiren('')).toBe(false);
  });
});

describe('hasSirenFormat', () => {
  it('checks the shape of the number, not its checksum', () => {
    expect(hasSirenFormat('552100555')).toBe(true);
    expect(hasSirenFormat('55210055')).toBe(false);
    expect(hasSirenFormat('55210055A')).toBe(false);
  });
});

describe('normalizeSiren', () => {
  it('drops the spaces a SIREN is written with, typographic ones included', () => {
    expect(normalizeSiren('552 100 554')).toBe('552100554');
    expect(normalizeSiren(' 552100554 ')).toBe('552100554');
    expect(normalizeSiren('552\u00a0100\u00a0554')).toBe('552100554');
    expect(normalizeSiren('552\u202f100\u202f554')).toBe('552100554');
  });

  it('leaves other separators for the format check to refuse', () => {
    expect(normalizeSiren('552-100-554')).toBe('552-100-554');
    expect(isValidSiren(normalizeSiren('552-100-554'))).toBe(false);
  });

  it('turns a spaced SIREN into one the checksum accepts', () => {
    expect(isValidSiren(normalizeSiren('552 100 554'))).toBe(true);
  });
});

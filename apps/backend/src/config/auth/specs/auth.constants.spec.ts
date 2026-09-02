import { parseTrustedOrigins } from '../auth.constants';

describe('parseTrustedOrigins', () => {
  it('reads a single origin', () => {
    expect(parseTrustedOrigins('http://localhost:3000')).toEqual([
      'http://localhost:3000',
    ]);
  });

  it('reads several, trimming the whitespace a .env leaves behind', () => {
    expect(
      parseTrustedOrigins('http://localhost:3000, https://cartepro.fr'),
    ).toEqual(['http://localhost:3000', 'https://cartepro.fr']);
  });

  it('drops empty entries rather than trusting an empty origin', () => {
    expect(parseTrustedOrigins('http://localhost:3000,')).toEqual([
      'http://localhost:3000',
    ]);
    expect(parseTrustedOrigins(',, ,')).toEqual([]);
  });

  it('yields nothing when the variable is unset or blank', () => {
    expect(parseTrustedOrigins(undefined)).toEqual([]);
    expect(parseTrustedOrigins('')).toEqual([]);
    expect(parseTrustedOrigins('   ')).toEqual([]);
  });
});

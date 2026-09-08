import { isDebitAllowed } from '../wallet-debit.helper';

describe('isDebitAllowed', () => {
  it('allows a debit covered by the balance', () => {
    expect(isDebitAllowed(100, 40)).toBe(true);
    expect(isDebitAllowed(12.5, 12.5)).toBe(true);
  });

  it('allows a debit landing exactly on zero, and refuses one cent past it', () => {
    expect(isDebitAllowed(10, 10)).toBe(true);
    expect(isDebitAllowed(10, 10.01)).toBe(false);
  });

  it('refuses a debit that would leave the balance negative', () => {
    expect(isDebitAllowed(10, 200)).toBe(false);
    expect(isDebitAllowed(0, 0.01)).toBe(false);
  });

  it('compares in cents, so float representation cannot tip the boundary', () => {
    expect(isDebitAllowed(0.1 + 0.2, 0.3)).toBe(true);
    expect(isDebitAllowed(0.3, 0.1 + 0.2)).toBe(true);
  });
});

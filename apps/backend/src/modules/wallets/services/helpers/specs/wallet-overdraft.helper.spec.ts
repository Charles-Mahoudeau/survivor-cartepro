import { WALLET_OVERDRAFT_LIMIT } from '../../../constants';
import { isDebitAllowed } from '../wallet-overdraft.helper';

describe('isDebitAllowed', () => {
  it('allows a debit covered by the balance', () => {
    expect(isDebitAllowed(100, 40)).toBe(true);
    expect(isDebitAllowed(12.5, 12.5)).toBe(true);
  });

  it('allows a debit that dips into the overdraft', () => {
    expect(isDebitAllowed(20, 60)).toBe(true);
    expect(isDebitAllowed(0, 1)).toBe(true);
    expect(isDebitAllowed(-10, 5)).toBe(true);
  });

  it('allows a debit landing exactly on the limit, and refuses one cent past it', () => {
    expect(isDebitAllowed(0, WALLET_OVERDRAFT_LIMIT)).toBe(true);
    expect(isDebitAllowed(0, WALLET_OVERDRAFT_LIMIT + 0.01)).toBe(false);
    expect(isDebitAllowed(-WALLET_OVERDRAFT_LIMIT, 0.01)).toBe(false);
  });

  it('refuses a debit that would go past the overdraft', () => {
    expect(isDebitAllowed(10, 200)).toBe(false);
    expect(isDebitAllowed(-140, 20)).toBe(false);
  });

  it('compares in cents, so float representation cannot tip the boundary', () => {
    expect(isDebitAllowed(0.1 + 0.2, 0.3)).toBe(true);
    expect(isDebitAllowed(-149.9, 0.1)).toBe(true);
    expect(isDebitAllowed(-149.9, 0.11)).toBe(false);
  });
});

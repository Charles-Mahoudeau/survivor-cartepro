import { totalCredited } from '../total.helper';

describe('totalCredited', () => {
  it('multiplies the per-employee amount by the number of beneficiaries', () => {
    expect(totalCredited('90.00', 42)).toBe('3780.00');
    expect(totalCredited('50', 3)).toBe('150.00');
  });

  it('credits nothing when every wallet is excluded', () => {
    expect(totalCredited('90.00', 0)).toBe('0.00');
  });

  it('keeps the cents exact where a float product would drift', () => {
    expect(totalCredited('0.10', 3)).toBe('0.30');
    expect(totalCredited('1.15', 3)).toBe('3.45');
    expect(totalCredited('80.05', 7)).toBe('560.35');
  });

  it('holds on an amount as wide as the column allows', () => {
    expect(totalCredited('9999999999.99', 1)).toBe('9999999999.99');
  });
});

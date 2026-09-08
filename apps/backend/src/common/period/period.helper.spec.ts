import { describe, expect, it } from '@jest/globals';
import { DEFAULT_PERIOD_DAYS } from './period.constants';
import { InvalidPeriodError, resolvePeriod } from './period.helper';

const DEFAULT_PERIOD_IN_MS = DEFAULT_PERIOD_DAYS * 24 * 60 * 60 * 1000;

describe('period helper', () => {
  it('reads the last thirty days when no bound is given', () => {
    const before = Date.now();
    const { from, to } = resolvePeriod({});
    const after = Date.now();

    expect(to).toBeNull();
    expect(from.getTime()).toBeGreaterThanOrEqual(
      before - DEFAULT_PERIOD_IN_MS,
    );
    expect(from.getTime()).toBeLessThanOrEqual(after - DEFAULT_PERIOD_IN_MS);
  });

  it('keeps both bounds when both are given', () => {
    expect(
      resolvePeriod({
        from: '2026-03-01T00:00:00.000Z',
        to: '2026-03-31T00:00:00.000Z',
      }),
    ).toEqual({
      from: new Date('2026-03-01T00:00:00.000Z'),
      to: new Date('2026-03-31T00:00:00.000Z'),
    });
  });

  it('counts the default window back from an explicit end', () => {
    expect(resolvePeriod({ to: '2026-03-31T00:00:00.000Z' }).from).toEqual(
      new Date('2026-03-01T00:00:00.000Z'),
    );
  });

  it('leaves the end open when only a start is given', () => {
    expect(resolvePeriod({ from: '2026-03-01T00:00:00.000Z' })).toEqual({
      from: new Date('2026-03-01T00:00:00.000Z'),
      to: null,
    });
  });

  it('accepts a start equal to the end', () => {
    const instant = '2026-03-01T00:00:00.000Z';

    expect(resolvePeriod({ from: instant, to: instant })).toEqual({
      from: new Date(instant),
      to: new Date(instant),
    });
  });

  it('rejects a start later than the end', () => {
    expect(() =>
      resolvePeriod({
        from: '2026-03-31T00:00:00.000Z',
        to: '2026-03-01T00:00:00.000Z',
      }),
    ).toThrow(InvalidPeriodError);
  });
});

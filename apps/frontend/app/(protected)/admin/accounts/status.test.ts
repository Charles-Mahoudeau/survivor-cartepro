import { describe, expect, it } from 'bun:test';

import { accountStatusOf } from './status';

const NOW = new Date('2026-09-10T12:00:00.000Z');

describe('accountStatusOf', () => {
  it('reads an account that carries no ban as active', () => {
    expect(accountStatusOf({ banned: false, banExpires: null }, NOW)).toBe(
      'active',
    );
    expect(accountStatusOf({ banned: null, banExpires: null }, NOW)).toBe(
      'active',
    );
    expect(accountStatusOf({}, NOW)).toBe('active');
  });

  it('reads a ban with no end date as a closure', () => {
    expect(accountStatusOf({ banned: true, banExpires: null }, NOW)).toBe(
      'closed',
    );
    expect(accountStatusOf({ banned: true }, NOW)).toBe('closed');
  });

  it('reads a ban that ends later as a suspension', () => {
    expect(
      accountStatusOf(
        { banned: true, banExpires: '2026-09-17T12:00:00.000Z' },
        NOW,
      ),
    ).toBe('suspended');
  });

  it('still reads a ban ending at this very instant as a suspension, since sign-in only lifts a ban that has passed', () => {
    expect(
      accountStatusOf({ banned: true, banExpires: NOW.toISOString() }, NOW),
    ).toBe('suspended');
  });

  it('reads a ban whose end has passed as active, since the next sign-in lifts it', () => {
    expect(
      accountStatusOf(
        { banned: true, banExpires: '2026-09-10T11:59:59.999Z' },
        NOW,
      ),
    ).toBe('active');
  });

  it('ignores an end date left on an account that is no longer banned', () => {
    expect(
      accountStatusOf(
        { banned: false, banExpires: '2026-09-17T12:00:00.000Z' },
        NOW,
      ),
    ).toBe('active');
  });
});

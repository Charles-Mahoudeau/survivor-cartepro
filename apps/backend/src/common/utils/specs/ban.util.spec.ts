import { isBanActive } from '../ban.util';

const NOW = new Date('2026-09-02T12:00:00.000Z');

describe('isBanActive', () => {
  it('lets an account through when nothing marks it banned', () => {
    expect(isBanActive({}, NOW)).toBe(false);
    expect(isBanActive({ banned: false }, NOW)).toBe(false);
    expect(isBanActive({ banned: null }, NOW)).toBe(false);
  });

  it('keeps out an account banned with no expiry', () => {
    expect(isBanActive({ banned: true }, NOW)).toBe(true);
    expect(isBanActive({ banned: true, banExpires: null }, NOW)).toBe(true);
  });

  it('keeps out an account whose ban expires later', () => {
    const banExpires = new Date('2026-09-02T12:00:01.000Z');
    expect(isBanActive({ banned: true, banExpires }, NOW)).toBe(true);
  });

  it('lets back in an account whose ban has expired', () => {
    const banExpires = new Date('2026-09-02T11:59:59.000Z');
    expect(isBanActive({ banned: true, banExpires }, NOW)).toBe(false);
  });

  it('treats the exact expiry instant as over', () => {
    expect(isBanActive({ banned: true, banExpires: NOW }, NOW)).toBe(false);
  });

  it('ignores an expiry left behind on an unbanned account', () => {
    const banExpires = new Date('2026-12-31T00:00:00.000Z');
    expect(isBanActive({ banned: false, banExpires }, NOW)).toBe(false);
  });
});

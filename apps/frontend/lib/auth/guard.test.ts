import { describe, expect, it } from 'bun:test';

import { roleHome, safeRedirect } from './guard';

describe('roleHome', () => {
  it('sends each role to its own space', () => {
    expect(roleHome('employee')).toBe('/me');
    expect(roleHome('partner')).toBe('/pro');
    expect(roleHome('admin')).toBe('/admin');
  });

  it('falls back to the employee space rather than nowhere', () => {
    expect(roleHome(null)).toBe('/me');
    expect(roleHome(undefined)).toBe('/me');
    expect(roleHome('inconnu')).toBe('/me');
  });
});

describe('safeRedirect', () => {
  it('honours the requested path once the role is known', () => {
    expect(safeRedirect('/me/history', 'employee')).toBe('/me/history');
  });

  it('refuses an absolute url, which would send the account off the site', () => {
    expect(safeRedirect('https://exemple.test/vol', 'employee')).toBe('/me');
  });

  it('refuses a protocol-relative url, which reads as a path but is not one', () => {
    expect(safeRedirect('//exemple.test/vol', 'employee')).toBe('/me');
  });

  it('sends an admin to its own space when no path is requested', () => {
    expect(safeRedirect(null, 'admin')).toBe('/admin');
    expect(safeRedirect('', 'admin')).toBe('/admin');
  });
});

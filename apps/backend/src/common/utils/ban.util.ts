/**
 * Whether a ban is still in force at a given instant.
 *
 * `banned` alone is not the answer: the admin plugin writes an expiry alongside
 * it, and reading only the flag would keep a temporary ban permanent — the
 * account would never come back and nothing would say why.
 *
 * The instant is a parameter rather than a call to `Date.now()` so the boundary
 * can be tested at all, including the exact millisecond of expiry.
 */
export function isBanActive(
  user: { banned?: boolean | null; banExpires?: Date | null },
  now: Date,
): boolean {
  if (!user.banned) {
    return false;
  }

  if (!user.banExpires) {
    return true;
  }

  return user.banExpires.getTime() > now.getTime();
}

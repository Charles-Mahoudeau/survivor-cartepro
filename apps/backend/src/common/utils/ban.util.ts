/**
 * Whether a ban is still in force at a given instant.
 *
 * `banned` alone is not the answer: the admin plugin writes an expiry alongside
 * it, and reading only the flag would make every temporary ban permanent.
 *
 * The instant is a parameter so the boundary can be tested at all.
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

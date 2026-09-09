import type { PartnerStatus } from '@/lib/api/schemas/backend/partner';

/**
 * Defined without a directive so the server page and its client half read the
 * same list: an export of a `'use client'` module reaches the server as a
 * client reference, not as a value.
 */
export const REVIEWABLE_STATUSES = [
  'pending',
  'active',
  'refused',
] as const satisfies readonly PartnerStatus[];

export type ReviewableStatus = (typeof REVIEWABLE_STATUSES)[number];

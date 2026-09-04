/** The public catalogue as a whole. Invalidated when a registration is decided. */
export const PARTNERS_TAG = 'partners';

export const buildPartnerCacheKey = (partnerId: string) =>
  `partner-${partnerId}`;

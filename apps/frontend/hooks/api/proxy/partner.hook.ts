import 'server-only';

import { cacheLife, cacheTag } from 'next/cache';

import { ECODES } from '@/lib/api/clients';
import { type ApiResponse, ApiError } from '@/lib/api/helpers';
import { toHook } from '@/lib/api/helpers/toHook';
import { getPartner, listPartners } from '@/lib/api/routes/partner';
import type {
  ListPartnersQuery,
  Partner,
  PartnerPage,
} from '@/lib/api/schemas/backend/partner';
import { buildPartnerCacheKey, PARTNERS_TAG } from '@/lib/cache/tags';

/**
 * The catalogue depends on no user and changes when the administration
 * decides on a registration, so it is cached and tagged. A failed call is
 * thrown, not returned: a thrown value is never written to the cache.
 */
async function loadPartners(
  query: ListPartnersQuery,
): Promise<ApiResponse<PartnerPage>> {
  'use cache';
  cacheLife('hours');
  cacheTag(PARTNERS_TAG);

  const response = await listPartners(query);
  if (response.error) {
    throw new ApiError(response.error);
  }
  return response;
}

async function loadPartner(partnerId: string): Promise<ApiResponse<Partner>> {
  'use cache';
  cacheLife('hours');
  cacheTag(PARTNERS_TAG, buildPartnerCacheKey(partnerId));

  const response = await getPartner(partnerId);
  if (response.error && response.error !== ECODES.PARTNER_NOT_FOUND) {
    throw new ApiError(response.error);
  }
  return response;
}

export const listPartnersHook = toHook('listPartners', loadPartners);

export const getPartnerHook = toHook('getPartner', loadPartner, {
  notFounds: [ECODES.PARTNER_NOT_FOUND],
});

export { loadPartners };

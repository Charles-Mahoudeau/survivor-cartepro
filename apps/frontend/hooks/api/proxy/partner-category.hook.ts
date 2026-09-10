import 'server-only';

import { cacheLife, cacheTag } from 'next/cache';

import { type ApiResponse, ApiError } from '@/lib/api/helpers';
import { toHook } from '@/lib/api/helpers/toHook';
import { listPartnerCategories } from '@/lib/api/routes/partner-category';
import type { PartnerCategory } from '@/lib/api/schemas/backend/partner-category';
import { PARTNER_CATEGORIES_TAG, PARTNERS_TAG } from '@/lib/cache/tags';

async function loadPartnerCategories(): Promise<
  ApiResponse<PartnerCategory[]>
> {
  'use cache';
  cacheLife('hours');
  cacheTag(PARTNER_CATEGORIES_TAG, PARTNERS_TAG);

  const response = await listPartnerCategories();
  if (response.error) {
    throw new ApiError(response.error);
  }
  return response;
}

/** The category list, cached: its counts only move when a registration is decided. */
export const listPartnerCategoriesHook = toHook(
  'listPartnerCategories',
  loadPartnerCategories,
);

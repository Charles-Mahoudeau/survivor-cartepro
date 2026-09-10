'use server';

import { revalidatePath, updateTag } from 'next/cache';
import { returnValidationErrors } from 'next-safe-action';

import { API_ERROR_MESSAGES } from '@/constants/api-errors';
import { ECODES } from '@/lib/api/clients';
import { ApiError } from '@/lib/api/helpers';
import { geocodeAddress } from '@/lib/api/routes/geocoding';
import {
  getMyPartnerProfile,
  updateMyPartnerProfile,
} from '@/lib/api/routes/partner';
import type { Coordinates } from '@/lib/api/schemas/geocoding';
import { PARTNERS_TAG } from '@/lib/cache/tags';
import { actionClient } from '@/lib/safe-action';

import {
  type ProfileFormInput,
  profileFormSchema,
} from '../schemas/profile.schema';

async function locate(address: ProfileFormInput): Promise<Coordinates> {
  const coordinates = await geocodeAddress(address);

  if (coordinates.error === ECODES.ADDRESS_NOT_FOUND) {
    returnValidationErrors(profileFormSchema, {
      addressLine: { _errors: [API_ERROR_MESSAGES.ADDRESS_NOT_FOUND] },
    });
  }

  if (coordinates.error) {
    throw new ApiError(coordinates.error);
  }

  return coordinates.data;
}

/** Saves the public details of the establishment, placing it again only when its address changed. */
export const updateProfileAction = actionClient
  .inputSchema(profileFormSchema)
  .action(async ({ parsedInput }) => {
    const current = await getMyPartnerProfile();

    if (current.error) {
      throw new ApiError(current.error);
    }

    const { tradeName, categories, addressLine, postalCode, city } =
      parsedInput;
    const addressChanged =
      addressLine !== current.data.addressLine ||
      postalCode !== current.data.postalCode ||
      city !== current.data.city;

    const { data, error } = await updateMyPartnerProfile(
      addressChanged
        ? {
            tradeName,
            categories,
            addressLine,
            postalCode,
            city,
            ...(await locate(parsedInput)),
          }
        : { tradeName, categories },
    );

    if (error) {
      throw new ApiError(error);
    }

    updateTag(PARTNERS_TAG);
    revalidatePath('/pro/account');

    return data;
  });

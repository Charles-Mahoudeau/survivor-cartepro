'use server';

import { returnValidationErrors } from 'next-safe-action';

import { API_ERROR_MESSAGES } from '@/constants/api-errors';
import { ECODES } from '@/lib/api/clients';
import { ApiError } from '@/lib/api/helpers';
import { geocodeAddress } from '@/lib/api/routes/geocoding';
import { createPartner } from '@/lib/api/routes/partner';
import { actionClient } from '@/lib/safe-action';
import { normalizeSiren } from '@/lib/siren';

import { partnerDossierSchema } from '../schemas/partner-signup.schema';

/** Places the shop from its address, then files the dossier for the signed-in account. */
export const registerPartnerAction = actionClient
  .inputSchema(partnerDossierSchema)
  .action(async ({ parsedInput }) => {
    const coordinates = await geocodeAddress(parsedInput);

    if (coordinates.error === ECODES.ADDRESS_NOT_FOUND) {
      returnValidationErrors(partnerDossierSchema, {
        addressLine: { _errors: [API_ERROR_MESSAGES.ADDRESS_NOT_FOUND] },
      });
    }

    if (coordinates.error) {
      throw new ApiError(coordinates.error);
    }

    const { data, error } = await createPartner({
      ...parsedInput,
      siren: normalizeSiren(parsedInput.siren),
      ...coordinates.data,
    });

    if (error === ECODES.PARTNER_SIREN_ALREADY_REGISTERED) {
      returnValidationErrors(partnerDossierSchema, {
        siren: {
          _errors: [API_ERROR_MESSAGES.PARTNER_SIREN_ALREADY_REGISTERED],
        },
      });
    }

    if (error) {
      throw new ApiError(error);
    }

    return data;
  });

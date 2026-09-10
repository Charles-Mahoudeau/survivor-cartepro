import { logger } from '@/lib/log';

import { ECODES } from '../../clients';
import { geocoding } from '../../clients/geocoding';
import type { ApiResponse } from '../../helpers';
import {
  type Coordinates,
  GEOCODING_ADDRESS_INDEX,
} from '../../schemas/geocoding/address';

const GEOCODING_MIN_SCORE = 0.5;
const GEOCODING_RESULT_LIMIT = 1;

/** The part of a dossier that places the shop on the map. */
export interface AddressToGeocode {
  addressLine: string;
  postalCode: string;
  city: string;
}

/** Resolves an address to coordinates, refusing a weak match or one in another postcode. */
export async function geocodeAddress(
  address: AddressToGeocode,
): Promise<ApiResponse<Coordinates>> {
  const { data, error } = await geocoding('@get/search', {
    query: {
      q: `${address.addressLine} ${address.city}`,
      postcode: address.postalCode,
      index: GEOCODING_ADDRESS_INDEX,
      limit: GEOCODING_RESULT_LIMIT,
    },
    cache: 'no-store',
  });

  if (error) {
    logger.error('Geocoding request failed', { error });
    return { data: null, error: ECODES.GEOCODING_UNAVAILABLE };
  }

  const [best] = data.features;

  if (
    !best ||
    best.properties.score < GEOCODING_MIN_SCORE ||
    best.properties.postcode !== address.postalCode
  ) {
    return { data: null, error: ECODES.ADDRESS_NOT_FOUND };
  }

  const [longitude, latitude] = best.geometry.coordinates;

  return { data: { latitude, longitude }, error: null };
}

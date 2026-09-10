import 'server-only';

import { createFetch, createSchema } from '@better-fetch/fetch';

import {
  geocodingResultSchema,
  geocodingSearchQuerySchema,
} from '../../schemas/geocoding/address';

/** The national address base, served by the IGN Géoplateforme. */
export const GEOCODING_BASE_URL = 'https://data.geopf.fr/geocodage';

const GEOCODING_TIMEOUT_MS = 5000;

const geocodingSchema = createSchema({
  '@get/search': {
    method: 'get',
    query: geocodingSearchQuerySchema,
    output: geocodingResultSchema,
  },
});

/** Typed client of the geocoding service, which takes no credentials. */
export const geocoding = createFetch({
  baseURL: GEOCODING_BASE_URL,
  schema: geocodingSchema,
  catchAllError: true,
  timeout: GEOCODING_TIMEOUT_MS,
});

import { z } from 'zod';

/** The index of the address base that holds street numbers, not streets or towns. */
export const GEOCODING_ADDRESS_INDEX = 'address';

export const geocodingSearchQuerySchema = z.object({
  q: z.string().min(1),
  postcode: z.string(),
  index: z.literal(GEOCODING_ADDRESS_INDEX),
  limit: z.number().int().min(1),
});

export const geocodedAddressSchema = z.object({
  geometry: z.object({
    coordinates: z.tuple([z.number(), z.number()]),
  }),
  properties: z.object({
    label: z.string(),
    score: z.number(),
    postcode: z.string(),
    city: z.string(),
  }),
});

export const geocodingResultSchema = z.object({
  features: z.array(geocodedAddressSchema),
});

export const coordinatesSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export type GeocodingSearchQuery = z.infer<typeof geocodingSearchQuerySchema>;
export type GeocodingResult = z.infer<typeof geocodingResultSchema>;
export type Coordinates = z.infer<typeof coordinatesSchema>;

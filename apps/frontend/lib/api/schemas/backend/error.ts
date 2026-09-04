import { z } from 'zod';

/**
 * The body NestJS puts on the wire for an `HttpException`. `message` carries
 * the stable error code the backend registers in `ERROR_CODES`, or the list
 * of constraint messages when the global `ValidationPipe` refuses a query.
 */
export const backendErrorSchema = z.object({
  statusCode: z.number(),
  message: z.union([z.string(), z.array(z.string())]),
  error: z.string().optional(),
});

export type BackendError = z.infer<typeof backendErrorSchema>;

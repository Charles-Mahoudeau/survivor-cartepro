import type { z } from 'zod';

import { ECODES } from '../../clients';
import { type ApiResponse, handleApiError } from '../../helpers';

const USER_NOT_FOUND = 'USER_NOT_FOUND';
const CANNOT_BAN_YOURSELF = 'YOU_CANNOT_BAN_YOURSELF';

/** Maps an error of the Better Auth admin routes to a code the frontend branches on. */
export function handleAccountError<T>(error: {
  code?: string;
  status?: number;
}): ApiResponse<T> {
  if (error.code === USER_NOT_FOUND) {
    return { data: null, error: ECODES.ACCOUNT_NOT_FOUND };
  }
  if (error.code === CANNOT_BAN_YOURSELF) {
    return { data: null, error: ECODES.ACCOUNT_SELF_SUSPENSION };
  }
  return handleApiError<T>(error);
}

/** Validates what Better Auth answered, which no typed schema checked on the way in. */
export function parseAccountResponse<Schema extends z.ZodType>(
  schema: Schema,
  data: unknown,
): ApiResponse<z.infer<Schema>> {
  const parsed = schema.safeParse(data);

  if (!parsed.success) {
    return { data: null, error: ECODES.VALIDATION_FAILED };
  }

  return { data: parsed.data, error: null };
}

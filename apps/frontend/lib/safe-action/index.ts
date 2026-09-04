import { createSafeActionClient } from 'next-safe-action';

import { API_ERROR_MESSAGES } from '@/constants/api-errors';
import { ApiError } from '@/lib/api/helpers';

export const actionClient = createSafeActionClient({
  handleServerError(error) {
    if (error instanceof ApiError) {
      return API_ERROR_MESSAGES[error.code];
    }
    console.error(error);
    return API_ERROR_MESSAGES.UNKNOWN_ERROR;
  },
});

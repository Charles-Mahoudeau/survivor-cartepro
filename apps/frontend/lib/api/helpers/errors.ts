import 'server-only';

import { ValidationError } from '@better-fetch/fetch';

import { logger } from '@/lib/log';
import { ECODES } from '../clients';
import type { ApiErrorCode, ApiResponse } from './types';

const UNAUTHORIZED_STATUS = 401;
const FORBIDDEN_STATUS = 403;
const BAD_REQUEST_STATUS = 400;
const FIRST_SERVER_ERROR_STATUS = 500;
const NO_RESPONSE_STATUS = 0;

/** Thrown by server actions; `actionClient` turns it into a message. */
export class ApiError extends Error {
  constructor(
    public code: ApiErrorCode,
    public data?: unknown,
  ) {
    super(code);
    this.name = 'ApiError';
  }
}

export function isApiErrorCode(value: unknown): value is ApiErrorCode {
  return typeof value === 'string' && value in ECODES;
}

interface FetchErrorLike {
  status?: number;
  statusCode?: number;
  message?: unknown;
  error?: unknown;
}

function isAbortError(error: unknown): boolean {
  const candidates = [error, (error as FetchErrorLike | null)?.error];
  return candidates.some(
    (candidate) =>
      candidate instanceof Error && candidate.name === 'AbortError',
  );
}

/**
 * Maps a better-fetch error to a stable code. The backend puts its code in
 * `message`; every other shape is classified by status.
 */
export function handleApiError<T>(
  error: unknown,
  mute: boolean = false,
): ApiResponse<T> {
  const code = toApiErrorCode(error);

  if (!mute && code !== ECODES.ERR_API_FETCH_FAILED) {
    logger.error(`Api Error Handler: ${code}`, { error: code });
  }

  return { data: null, error: code };
}

function toApiErrorCode(error: unknown): ApiErrorCode {
  if (isAbortError(error)) {
    return ECODES.ERR_API_FETCH_FAILED;
  }

  if (error instanceof ValidationError) {
    return ECODES.VALIDATION_FAILED;
  }

  const shape = (error ?? {}) as FetchErrorLike;

  if (isApiErrorCode(shape.message)) {
    return shape.message;
  }

  const status = shape.status ?? shape.statusCode;

  if (status === undefined || status === NO_RESPONSE_STATUS) {
    return ECODES.ERR_API_CONNECTION_REFUSED;
  }
  if (status === UNAUTHORIZED_STATUS) {
    return ECODES.UNAUTHENTICATED;
  }
  if (status === FORBIDDEN_STATUS) {
    return ECODES.FORBIDDEN_ROLE;
  }
  if (status === BAD_REQUEST_STATUS) {
    return ECODES.BAD_REQUEST;
  }
  if (status >= FIRST_SERVER_ERROR_STATUS) {
    return ECODES.INTERNAL_SERVER_ERROR;
  }

  return ECODES.UNKNOWN_ERROR;
}

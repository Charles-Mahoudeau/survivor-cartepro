import type { BackendErrorCode } from '../clients';

export type ApiErrorCode = BackendErrorCode;

export type ApiResponse<T> =
  { data: T; error: null } | { data: null; error: ApiErrorCode };

import 'server-only';

import { forbidden as forbiddenNavigation, notFound } from 'next/navigation';
import { cache } from 'react';

import { throwNextError } from '@/lib/log';
import type { ApiErrorCode, ApiResponse } from './types';

interface Options<T extends ApiResponse<unknown>, R = T['data']> {
  notFounds?: ApiErrorCode[];
  forbidden?: ApiErrorCode[];
  transform?: (data: NonNullable<T['data']>) => R;
  onNoData?: () => void;
  onError?: (error: ApiErrorCode) => void;
  handleError?: (error: ApiErrorCode) => NonNullable<R>;
  onSuccess?: (data: NonNullable<R>) => void;
}

/**
 * Turns a route function into a page-level loader: memoised for the render,
 * and translating error codes into navigation instead of returning them.
 */
// Optional mode: returns null on error.
export function toHook<
  T extends ApiResponse<unknown>,
  R = T['data'],
  Args extends unknown[] = unknown[],
>(
  name: string,
  fn: (...args: Args) => Promise<T>,
  options: Options<T, R> & { optional: true },
): (...args: Args) => Promise<R | null>;

// Default mode: throws on error.
export function toHook<
  T extends ApiResponse<unknown>,
  R = T['data'],
  Args extends unknown[] = unknown[],
>(
  name: string,
  fn: (...args: Args) => Promise<T>,
  options?: Options<T, R>,
): (...args: Args) => Promise<NonNullable<R>>;

export function toHook<
  T extends ApiResponse<unknown>,
  R = T['data'],
  Args extends unknown[] = unknown[],
>(
  name: string,
  fn: (...args: Args) => Promise<T>,
  options: Options<T, R> & { optional?: boolean } = {} as Options<T, R>,
): (...args: Args) => Promise<NonNullable<R> | R | null> {
  const {
    notFounds = [],
    forbidden = [],
    transform,
    onNoData,
    onError,
    onSuccess,
    handleError,
    optional = false,
  } = options;

  return cache(async (...args: Args): Promise<NonNullable<R> | R | null> => {
    const { data, error } = await fn(...args);

    if (error) {
      if (optional) {
        onError?.(error);
        return null;
      }

      if (onError) {
        onError(error);
      } else if (notFounds.includes(error)) {
        notFound();
      } else if (forbidden.includes(error)) {
        forbiddenNavigation();
      }
      if (handleError) {
        return handleError(error);
      }
      throwNextError(new Error(error), `${name} hook returned an error`);
    }

    if (!data) {
      if (optional) {
        return null;
      }
      onNoData?.();
      throwNextError(
        new Error(`${name} expected returned no data`),
        'No data returned from the API',
      );
    }

    const result = transform
      ? transform(data as NonNullable<T['data']>)
      : (data as R);

    onSuccess?.(result as NonNullable<R>);

    return result as NonNullable<R>;
  });
}

import 'server-only';

/**
 * Server-side logging. Console-backed on purpose: the API already redacts
 * amounts from its own logs, and this layer never receives a response body.
 */
export const logger = {
  error(message: string, meta?: Record<string, unknown>) {
    console.error(message, meta ?? '');
  },
  debug(message: string, meta?: Record<string, unknown>) {
    if (process.env.NODE_ENV === 'development') {
      console.debug(message, meta ?? '');
    }
  },
};

export function throwNextError(error: Error | string, name?: string): never {
  logger.error(
    `SSR Error${name ? `, ${name}` : ''} : ${
      error instanceof Error ? error.message : error
    }`,
    { error },
  );
  throw error instanceof Error ? error : new Error(error);
}

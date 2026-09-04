import 'server-only';

/**
 * Server-only configuration.
 *
 * Neither value is NEXT_PUBLIC_: a prefixed variable is inlined into the bundle
 * at build time, which would freeze one deployment's hostnames into every image
 * and publish the internal network topology to anyone reading the JavaScript.
 *
 * Development defaults match `bun run dev`, where the API listens on 3001 and
 * the web app on 3000. Production has no default: a missing value fails here
 * rather than as a confusing fetch error on the first sign-in.
 */
const DEVELOPMENT_DEFAULTS: Record<string, string> = {
  BACKEND_INTERNAL_URL: 'http://localhost:3001',
  APP_ORIGIN: 'http://localhost:3000',
};

function read(name: keyof typeof DEVELOPMENT_DEFAULTS): string {
  const value = process.env[name];
  if (value) {
    return value;
  }

  if (process.env.NODE_ENV !== 'production') {
    return DEVELOPMENT_DEFAULTS[name]!;
  }

  throw new Error(`Missing required environment variable: ${name}`);
}

/** Where the server-side client reaches the API, on the internal network. */
export function backendInternalUrl(): string {
  return read('BACKEND_INTERNAL_URL');
}

/**
 * The public origin of this application. The auth handler compares it against
 * its trusted origins on every write that carries a cookie, so it has to be one
 * of the values in AUTH_TRUSTED_ORIGINS on the API side.
 */
export function appOrigin(): string {
  return read('APP_ORIGIN');
}

import type { NextConfig } from 'next';

/** Matches the development default of lib/env.ts, where the API listens. */
const DEVELOPMENT_BACKEND_URL = 'http://localhost:3001';

const nextConfig: NextConfig = {
  output: 'standalone',

  /**
   * Every read is classified: cached with `use cache`, streamed behind
   * `<Suspense>`, or private. A session read outside a boundary fails the
   * build instead of being discovered in production.
   */
  cacheComponents: true,

  experimental: {
    /** `forbidden()` and `forbidden.tsx`, for a session whose role is refused. */
    authInterrupts: true,

    /**
     * Automatic instant-navigation validation fails on every route, including
     * an empty page, with Next's own `InvariantError: Cannot access
     * "moduleLoading" without a work store` (E952, surfaced as E1286). The
     * validation render has no work store when the DSFR provider, mounted in
     * the root layout, resolves its `import('./dsfr/dsfr.module')`. Validation
     * stays available per segment through `export const instant`.
     */
    instantInsights: {
      validationLevel: 'manual-warning',
    },
  },

  /**
   * The browser talks to /auth on its own origin, which keeps the session
   * cookie first-party and CORS out of the picture. In production the edge
   * router does that mapping; in development there is no edge, so Next stands
   * in for it. Adding the rewrite in production would send the traffic through
   * a container that is not on its path.
   */
  async rewrites() {
    if (process.env.NODE_ENV === 'production') {
      return [];
    }

    const backend = process.env.BACKEND_INTERNAL_URL ?? DEVELOPMENT_BACKEND_URL;

    return [{ source: '/auth/:path*', destination: `${backend}/auth/:path*` }];
  },
};

export default nextConfig;

import { withSerwist } from '@serwist/turbopack';
import type { NextConfig } from 'next';

/** Bundled and served by app/serwist/[path]/route.ts. */
const SERVICE_WORKER_PATH = '/serwist/sw.js';

/**
 * The worker must never settle into an HTTP cache: a frozen copy would never be
 * replaced by the next deploy, and the app would keep an old caching policy.
 */
const SERVICE_WORKER_CACHE_CONTROL = 'public, max-age=0, must-revalidate';

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

  async headers() {
    return [
      {
        source: SERVICE_WORKER_PATH,
        headers: [
          { key: 'Cache-Control', value: SERVICE_WORKER_CACHE_CONTROL },
          { key: 'Service-Worker-Allowed', value: '/' },
        ],
      },
    ];
  },
};

export default withSerwist(nextConfig);

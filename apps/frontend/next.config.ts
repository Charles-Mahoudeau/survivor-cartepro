import type { NextConfig } from 'next';

/** Matches the development default of lib/env.ts, where the API listens. */
const DEVELOPMENT_BACKEND_URL = 'http://localhost:3001';

const nextConfig: NextConfig = {
  output: 'standalone',

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

import { createSerwistRoute } from '@serwist/turbopack';

import { PWA_OFFLINE_URL } from '@/constants/pwa';

/**
 * Bundles the worker and serves it at /serwist/sw.js, with a precache manifest
 * generated from the build output.
 */
export const { dynamic, dynamicParams, revalidate, generateStaticParams, GET } =
  createSerwistRoute({
    swSrc: 'lib/sw/sw.ts',
    // Defaults to esbuild-wasm off Windows; the native package is installed.
    useNativeEsbuild: true,
    // The offline page is a rendered route, not a build asset, so the glob
    // never sees it. Its revision follows the build so a deploy replaces it.
    additionalPrecacheEntries: [
      {
        url: PWA_OFFLINE_URL,
        revision: process.env.SW_PUBLIC_BUILD_ID ?? 'dev',
      },
    ],
  });

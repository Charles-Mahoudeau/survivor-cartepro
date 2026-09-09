import type { MetadataRoute } from 'next';

/** Installed-app surface. Colors are shared with `app/manifest.ts`. */

/** Tints the system UI around the installed app. */
export const PWA_THEME_COLOR = '#171717';

/** Painted before the first frame of a cold launch. */
export const PWA_BACKGROUND_COLOR = '#ffffff';

export const PWA_SCOPE = '/';

/** Where the installed app opens; the root routes a visitor to its space. */
export const PWA_START_URL = '/';

/** Served by the worker when a navigation cannot reach the network. */
export const PWA_OFFLINE_URL = '/offline';

/** Bundled and served by `app/serwist/[path]/route.ts`, not from `public/`. */
export const SERVICE_WORKER_URL = '/serwist/sw.js';

/** Remembers a dismissed install invitation. Per browser, never sent anywhere. */
export const PWA_INSTALL_DISMISSED_KEY = 'cartepro.install-dismissed';

/**
 * Chromium requires a 192 and a 512 raster icon before it treats the app as
 * installable; the SVG alone is not enough. The maskable one carries the safe
 * zone Android crops to.
 */
export const PWA_ICONS: MetadataRoute.Manifest['icons'] = [
  { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' },
  { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
  { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
  {
    src: '/icons/icon-512.png',
    sizes: '512x512',
    type: 'image/png',
    purpose: 'maskable',
  },
];

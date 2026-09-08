import type { MetadataRoute } from 'next';

import {
  PWA_BACKGROUND_COLOR,
  PWA_ICONS,
  PWA_SCOPE,
  PWA_START_URL,
  PWA_THEME_COLOR,
} from '@/constants/pwa';
import { SITE_CONTENT } from '@/content/site';

/**
 * Served at /manifest.webmanifest. Reads no request-time API, so it stays
 * static under `cacheComponents`.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: PWA_SCOPE,
    name: SITE_CONTENT.title,
    short_name: SITE_CONTENT.brand,
    description: SITE_CONTENT.description,
    start_url: PWA_START_URL,
    scope: PWA_SCOPE,
    display: 'standalone',
    lang: 'fr',
    dir: 'ltr',
    background_color: PWA_BACKGROUND_COLOR,
    theme_color: PWA_THEME_COLOR,
    icons: PWA_ICONS,
  };
}

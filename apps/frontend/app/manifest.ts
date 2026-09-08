import type { MetadataRoute } from 'next';

import { SITE_CONTENT } from '@/content/site';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_CONTENT.title,
    short_name: SITE_CONTENT.brand,
    description: SITE_CONTENT.description,
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#171717',
    icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' }],
  };
}

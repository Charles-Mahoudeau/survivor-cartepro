import type { MetadataRoute } from 'next';

import { SITE_CONTENT } from '@/content/site';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_CONTENT.title,
    short_name: SITE_CONTENT.brand,
    description: SITE_CONTENT.description,
    start_url: '/',
    display: 'standalone',
    background_color: '#faf7f2',
    theme_color: '#0e6b4f',
    icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' }],
  };
}

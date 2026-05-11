import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  const base = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/$/, '');

  return {
    id: `${base}/`,
    name: 'StayHub — Hotel Booking',
    short_name: 'StayHub',
    description: 'Browse hotels, compare rooms, and book your next stay with confidence.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    display_override: ['standalone', 'browser'],
    background_color: '#0f172a',
    theme_color: '#0f172a',
    orientation: 'any',
    categories: ['travel', 'lifestyle'],
    icons: [
      {
        src: '/icon',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}

import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'MG PVT LTD Partner Portal',
    short_name: 'MG Portal',
    description: 'MG PVT LTD digital partner and print portal',
    start_url: '/dashboard',
    display: 'standalone',
    background_color: '#060b14',
    theme_color: '#06b6d4',
    orientation: 'portrait-primary',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  };
}

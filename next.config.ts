import type { NextConfig } from 'next';

/**
 * Keep the existing frontend code compatible with the production API variable.
 * Older pages read NEXT_PUBLIC_API_URL while the documented production setting
 * is NEXT_PUBLIC_API_BASE_URL. Vercel injects the latter into this alias at build time.
 */
const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_API_URL:
      process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || '',
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/dashboard',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;

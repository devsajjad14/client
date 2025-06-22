import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  experimental: {
    useCache: true,

    cacheLife: {
      biweekly: {
        stale: 60 * 60 * 24 * 14, // 14 days
        revalidate: 60 * 60 * 24 * 7, // 7 day
        expire: 60 * 60 * 24 * 14, // 14 days
      },
    },
  },
  images: {
    minimumCacheTTL: 86400, // 1 day in seconds
    deviceSizes: [320, 640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    formats: ['image/avif', 'image/webp'],

    unoptimized: false, // Set to true for unoptimized images
    loader: 'default', // Use default Next.js image loader

    remotePatterns: [
      {
        hostname: '**',
      },
    ],
  },

  // ✅ Ignore ESLint and TypeScript errors during build
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
}

export default nextConfig

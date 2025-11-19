/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable Turbopack for Next.js 15 (already enabled via --turbo flag in dev script)
  // Enable compression
  compress: true,
  // Optimize images
  images: {
    unoptimized: true,
    formats: ['image/webp', 'image/avif'],
  },
  // Enable React strict mode for better development
  reactStrictMode: true,
  // Enable experimental features for better performance
  experimental: {
    optimizePackageImports: ['@radix-ui/react-icons', 'lucide-react'],
  },
  // Turbopack configuration (moved from experimental.turbo)
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      }
    }
    return config
  },
}

export default nextConfig
/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@easner/shared"],
  compress: true,
  images: {
    unoptimized: true,
    formats: ['image/webp', 'image/avif'],
  },
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
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

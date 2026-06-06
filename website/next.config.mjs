/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@easner/shared"],
  compress: true,
  images: {
    unoptimized: true,
    formats: ["image/webp", "image/avif"],
  },
  reactStrictMode: true,
  turbopack: {
    rules: {
      "*.svg": {
        loaders: ["@svgr/webpack"],
        as: "*.js",
      },
    },
  },
  async redirects() {
    return [
      { source: "/personal-banking", destination: "/personal", permanent: true },
      { source: "/business-banking", destination: "/business", permanent: true },
      { source: "/kyc-policy", destination: "/compliance", permanent: true },
    ]
  },
  async headers() {
    return [
      {
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ]
  },
  typescript: {
    ignoreBuildErrors: true,
  },
}

export default nextConfig

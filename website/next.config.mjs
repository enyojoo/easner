import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const monorepoRoot = path.join(__dirname, "..")

/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: monorepoRoot,
  transpilePackages: ["@easner/shared"],
  compress: true,
  images: {
    formats: ["image/webp", "image/avif"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "seeqjiebmrnolcyydewj.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  reactStrictMode: true,
  turbopack: {
    root: monorepoRoot,
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
      { source: "/blog", destination: "/", permanent: true },
      { source: "/blog/:path*", destination: "/", permanent: true },
    ]
  },
  typescript: {
    ignoreBuildErrors: true,
  },
}

export default nextConfig

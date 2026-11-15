import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const monorepoRoot = path.join(__dirname, "..")

/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: monorepoRoot,
  transpilePackages: ["@easner/shared", "@easner/blog-content"],
  reactStrictMode: true,
  poweredByHeader: false,
  turbopack: {
    root: monorepoRoot,
  },
  async redirects() {
    // Media, Categories and Redirects are tabs inside Settings now.
    return [
      { source: "/media", destination: "/settings?tab=media", permanent: false },
      { source: "/categories", destination: "/settings?tab=categories", permanent: false },
      { source: "/redirects", destination: "/settings?tab=redirects", permanent: false },
      { source: "/settings/:tab(media|categories|redirects)", destination: "/settings?tab=:tab", permanent: false },
    ]
  },
  async headers() {
    return [
      {
        // The admin is never indexed (plan §3a): every response says so, robots.txt disallows everything too.
        source: "/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ]
  },
}

export default nextConfig

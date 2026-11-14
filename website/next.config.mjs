import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const monorepoRoot = path.join(__dirname, "..")

/** Blog covers and author photos are served from the website Supabase project's public storage. */
const blogStorageHost = (() => {
  try {
    return process.env.SUPABASE_URL ? new URL(process.env.SUPABASE_URL).hostname : null
  } catch {
    return null
  }
})()

/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: monorepoRoot,
  // Files the share-image routes read at runtime (fonts, logo, fixture covers) must ship with the serverless output.
  outputFileTracingIncludes: {
    "/blog/**/*": [
      "../node_modules/geist/dist/fonts/geist-sans/Geist-Regular.ttf",
      "../node_modules/geist/dist/fonts/geist-sans/Geist-Bold.ttf",
      "./public/easner-logo.svg",
      "./public/easner-mark.svg",
    ],
  },
  transpilePackages: ["@easner/shared", "@easner/blog-content"],
  compress: true,
  images: {
    formats: ["image/webp", "image/avif"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "seeqjiebmrnolcyydewj.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      ...(blogStorageHost
        ? [{ protocol: "https", hostname: blogStorageHost, pathname: "/storage/v1/object/public/**" }]
        : []),
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
  typescript: {
    ignoreBuildErrors: true,
  },
  /**
   * Next cannot use "[slug].md" as a route segment, so the Markdown version of a post is a rewrite:
   * /blog/<slug>.md is served by the route handler at /api/blog/markdown/<slug>. The URL stays /blog/<slug>.md.
   */
  async rewrites() {
    return [{ source: "/blog/:slug.md", destination: "/api/blog/markdown/:slug" }]
  },
  async redirects() {
    return [{ source: "/ai", destination: "/answers", permanent: true }]
  },
  async headers() {
    return [
      {
        // Large image previews and full snippets for the blog's covers and text (Discover, answer engines).
        source: "/blog/:path*",
        headers: [{ key: "X-Robots-Tag", value: "max-image-preview:large, max-snippet:-1" }],
      },
      {
        source: "/:path*",
        headers: [
          {
            key: "Link",
            value: '</llms.txt>; rel="alternate"; type="text/plain"; title="LLMs.txt"',
          },
        ],
      },
    ]
  },
}

export default nextConfig

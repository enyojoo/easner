import type { MetadataRoute } from "next"

/** admin.easner.com is never crawled (plan §3a). Every response also sends X-Robots-Tag: noindex (next.config.mjs). */
export default function robots(): MetadataRoute.Robots {
  return { rules: [{ userAgent: "*", disallow: "/" }] }
}

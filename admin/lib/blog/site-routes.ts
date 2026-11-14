/** Real routes of the marketing site (website/app/(marketing)), without the blog. Update when a page is added. */
export const KNOWN_SITE_PATHS: string[] = [
  "/", "/about", "/answers", "/app", "/business", "/cards", "/checkout", "/compliance", "/contact", "/delete-account",
  "/developers", "/invoicing", "/legal", "/legal/disclosures", "/legal/disclosures/business-banking",
  "/legal/disclosures/digital-assets", "/legal/disclosures/personal-banking", "/legal/law-enforcement",
  "/legal/lightspark-eut", "/legal/partners", "/partners", "/payment-links", "/payroll", "/personal", "/pricing",
  "/privacy", "/stablecoin", "/terms",
]

const BLOG_SECTIONS = ["/blog", "/blog/authors", "/blog/categories"]

function normalise(path: string): string {
  const p = path.split(/[?#]/)[0] || "/"
  return p.length > 1 ? p.replace(/\/+$/, "") : p
}

/** A path the site serves: a page above, a blog section, or `/blog/<slug>` of a published post. */
export function isKnownPath(path: string, publishedSlugs: readonly string[] = []): boolean {
  const p = normalise(path)
  if (KNOWN_SITE_PATHS.includes(p) || BLOG_SECTIONS.includes(p)) return true
  const m = /^\/blog\/([^/]+)$/.exec(p)
  return Boolean(m && publishedSlugs.includes(m[1]))
}

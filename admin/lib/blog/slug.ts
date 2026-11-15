import { BLOG_RESERVED_SLUGS, slugify } from "@easner/blog-content"

/** The database also refuses `feed` (supabase blog_reserved_slugs). */
export const RESERVED_SLUGS: readonly string[] = [...BLOG_RESERVED_SLUGS, "feed"]
export const SLUG_MAX = 120

export function slugFromTitle(title: string): string {
  const slug = slugify(title).slice(0, SLUG_MAX).replace(/-+$/g, "")
  return slug
}

export type SlugCheck = { ok: true } | { ok: false; reason: string }

export function validateSlug(slug: string): SlugCheck {
  if (!slug) return { ok: false, reason: "Add a URL for this post." }
  if (slug.length > SLUG_MAX) return { ok: false, reason: `Keep the URL under ${SLUG_MAX} characters.` }
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) {
    return { ok: false, reason: "Use lower-case letters, numbers and single hyphens." }
  }
  if (RESERVED_SLUGS.includes(slug)) return { ok: false, reason: `"${slug}" is reserved for a section of the blog.` }
  return { ok: true }
}

/** Locked once the post has been published or is scheduled to be, for everyone but Owners. */
export function slugLocked({ publishedAt, role, status }: { publishedAt: string | null | undefined; role: string | null; status?: string | null }): boolean {
  return (Boolean(publishedAt) || status === "scheduled") && role !== "owner"
}

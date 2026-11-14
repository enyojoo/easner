import { validateSlug } from "./slug.ts"

/**
 * Checks for a hand-made redirect, mirroring `add_blog_redirect` in the database so the form can say what is wrong
 * before asking. The database is still the authority. Pure, tested.
 */
export interface RedirectRule {
  from: string
  to_post_id: string
}
export interface RedirectPost {
  id: string
  slug: string
  status: string
}

/** What people type: "/blog/Old-Post " becomes "old-post". */
export function normalizeFromSlug(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\/[^/]+/, "")
    .replace(/^\/?blog\//, "")
    .replace(/^\/+|\/+$/g, "")
}

export function validateRedirect({
  from,
  targetId,
  posts,
  existing,
}: {
  from: string
  targetId: string | null
  posts: RedirectPost[]
  existing: RedirectRule[]
}): string | null {
  const slug = normalizeFromSlug(from)
  if (!slug) return "Enter the old URL ending."
  const format = validateSlug(slug)
  if (!format.ok) return format.reason
  const owner = posts.find((post) => post.slug === slug)
  if (owner) return "A post already lives at that URL, so it can’t redirect."
  if (existing.some((rule) => rule.from === slug)) return "That URL already redirects somewhere. Remove the old redirect first."
  if (!targetId) return "Choose the post it should lead to."
  const target = posts.find((post) => post.id === targetId)
  if (!target || target.status !== "published") return "A redirect has to lead to a published post."
  if (target.slug === slug) return "A redirect can’t lead to itself."
  return null
}

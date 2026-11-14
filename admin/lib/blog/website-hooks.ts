import { createHmac, timingSafeEqual } from "node:crypto"

/** Server-only helpers for the admin ↔ website contract (packages/blog-content/README.md). Never import in the browser. */

export interface RevalidateChange {
  slug: string
  oldSlug?: string | null
  categorySlug?: string | null
  oldCategorySlug?: string | null
  authorSlugs?: string[]
  kind?: "publish" | "update" | "unpublish" | "slug" | "category" | "author"
}

export function revalidateBody(change: RevalidateChange): { tags: string[]; paths: string[] } {
  const tags = new Set<string>(["blog"])
  const paths = new Set<string>(["/blog"])
  const addPost = (slug?: string | null) => {
    if (!slug) return
    tags.add(`blog:post:${slug}`)
    paths.add(`/blog/${slug}`)
  }
  addPost(change.slug)
  addPost(change.oldSlug)
  for (const c of [change.categorySlug, change.oldCategorySlug]) if (c) tags.add(`blog:category:${c}`)
  for (const a of change.authorSlugs ?? []) if (a) tags.add(`blog:author:${a}`)
  return { tags: [...tags], paths: [...paths] }
}

const b64url = (input: Buffer | string) => Buffer.from(input).toString("base64url")

/** payload = base64url(JSON {postId, exp}); token = payload.base64url(HMAC_SHA256(payload, secret)). exp = now + 30 min. */
export function signPreviewToken(postId: string, secret: string, nowSeconds: number): string {
  const payload = b64url(JSON.stringify({ postId, exp: nowSeconds + 1800 }))
  const sig = createHmac("sha256", secret).update(payload).digest()
  return `${payload}.${b64url(sig)}`
}

export function verifyPreviewToken(token: string, secret: string, nowSeconds: number): { postId: string } | null {
  const [payload, sig, extra] = token.split(".")
  if (!payload || !sig || extra !== undefined) return null
  const expected = createHmac("sha256", secret).update(payload).digest()
  const given = Buffer.from(sig, "base64url")
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return null
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { postId?: unknown; exp?: unknown }
    if (typeof data.postId !== "string" || typeof data.exp !== "number" || data.exp < nowSeconds) return null
    return { postId: data.postId }
  } catch {
    return null
  }
}

export type WebsiteEnv =
  | { ok: true; url: string; revalidateSecret: string; previewSecret: string; indexNowKey?: string }
  | { ok: false; missing: string[] }

export function websiteEnv(env: Record<string, string | undefined>): WebsiteEnv {
  const get = (k: string) => env[k]?.trim() || ""
  const missing = ["WEBSITE_URL", "BLOG_REVALIDATE_SECRET", "BLOG_PREVIEW_SECRET"].filter((k) => !get(k))
  if (missing.length) return { ok: false, missing }
  const key = get("INDEXNOW_KEY")
  return {
    ok: true,
    url: get("WEBSITE_URL").replace(/\/+$/, ""),
    revalidateSecret: get("BLOG_REVALIDATE_SECRET"),
    previewSecret: get("BLOG_PREVIEW_SECRET"),
    ...(key ? { indexNowKey: key } : {}),
  }
}

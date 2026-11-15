import "server-only"

/**
 * Server-side helpers for the route handlers: act as the signed-in person (their access token, so RLS and the
 * role-checked functions decide), then tell the website. The website secrets live here and nowhere else.
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js"
import { SITE_ORIGIN } from "@easner/blog-content"
import { revalidateBody, websiteEnv, type RevalidateChange } from "@/lib/blog/website-hooks"
import type { WebsiteResult } from "@/components/editor/types"

export function bearerToken(request: Request): string | null {
  const header = request.headers.get("authorization") ?? ""
  const match = /^Bearer (.+)$/i.exec(header)
  return match ? match[1] : null
}

/** A Supabase client that acts as the person holding `token`. Null when the project isn't configured. */
export function clientFor(token: string): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  if (!url || !key) return null
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${token}`, "X-Client-Info": "easner-admin-server" } },
  })
}

/** Verifies the token with Supabase Auth. */
export async function verifiedClient(request: Request): Promise<{ client: SupabaseClient; userId: string } | Response> {
  const token = bearerToken(request)
  if (!token) return Response.json({ error: "Sign in again to continue." }, { status: 401 })
  const client = clientFor(token)
  if (!client) return Response.json({ error: "The admin isn’t connected to Supabase." }, { status: 503 })
  const { data, error } = await client.auth.getUser(token)
  if (error || !data.user) return Response.json({ error: "Sign in again to continue." }, { status: 401 })
  return { client, userId: data.user.id }
}

/** Calls the website's revalidate route. Never throws: a down website must not undo a publish. */
export async function revalidateWebsite(change: RevalidateChange): Promise<WebsiteResult> {
  const env = websiteEnv(process.env)
  if (!env.ok) return { status: "skipped", note: `The website wasn’t notified: ${env.missing.join(", ")} not set.` }
  try {
    const response = await fetch(`${env.url}/api/revalidate`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-revalidate-secret": env.revalidateSecret },
      body: JSON.stringify(revalidateBody(change)),
      signal: AbortSignal.timeout(8000),
    })
    if (!response.ok) {
      return { status: "failed", note: `The website answered ${response.status}. The page refreshes on its own within the hour.` }
    }
    return { status: "ok" }
  } catch {
    return { status: "failed", note: "The website couldn’t be reached. The page refreshes on its own within the hour." }
  }
}

/** Bing and the engines behind ChatGPT search pick up new URLs at once. Best effort, optional. */
export async function pingIndexNow(slug: string): Promise<void> {
  const key = process.env.INDEXNOW_KEY?.trim()
  if (!key) return
  try {
    const url = `${SITE_ORIGIN}/blog/${slug}`
    await fetch(`https://api.indexnow.org/indexnow?url=${encodeURIComponent(url)}&key=${encodeURIComponent(key)}`, {
      signal: AbortSignal.timeout(5000),
    })
  } catch {
    // Not worth failing a publish over.
  }
}

// ---- what the website needs to know about a post, shared by the manual actions and the scheduled publish ---------

const POST_FOR_SITE = "id, slug, status, category_id, blog_categories(slug), blog_post_authors(blog_authors(slug))"

export type SiteRow = {
  id: string
  slug: string
  status: string
  blog_categories: { slug: string } | { slug: string }[] | null
  blog_post_authors: Array<{ blog_authors: { slug: string } | { slug: string }[] | null }> | null
}

const first = <T,>(value: T | T[] | null | undefined): T | null => (Array.isArray(value) ? (value[0] ?? null) : (value ?? null))

export async function loadSiteRow(client: SupabaseClient, postId: string): Promise<SiteRow | null> {
  const { data } = await client.from("blog_posts").select(POST_FOR_SITE).eq("id", postId).maybeSingle()
  return (data as unknown as SiteRow | null) ?? null
}

export function siteChange(row: SiteRow, extra: { oldSlug?: string; oldCategorySlug?: string; kind: "publish" | "update" | "unpublish" | "slug" | "category" | "author" }): RevalidateChange {
  return {
    slug: row.slug,
    oldSlug: extra.oldSlug && extra.oldSlug !== row.slug ? extra.oldSlug : undefined,
    categorySlug: first(row.blog_categories)?.slug,
    oldCategorySlug: extra.oldCategorySlug,
    authorSlugs: (row.blog_post_authors ?? []).map((link) => first(link.blog_authors)?.slug).filter((s): s is string => Boolean(s)),
    kind: extra.kind,
  }
}

/** The secret key client: bypasses RLS. Only the cron route uses it; the key never leaves the server. */
export function secretClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SECRET_KEY
  if (!url || !key) return null
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { "X-Client-Info": "easner-admin-cron" } },
  })
}

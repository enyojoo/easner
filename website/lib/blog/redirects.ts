import { blogSource } from "./config"
import { FIXTURE_REDIRECTS } from "./fixtures/data"

/**
 * Old slug → current slug, from `blog_redirects`, for the 301s in proxy.ts. Embeds the target post's slug
 * (`blog_posts(slug)`), as supabase/README.md shows. Deliberately dependency-free (no `server-only`, no React cache):
 * it runs in the proxy, which keeps its own one-minute copy.
 */
export async function getRedirects(): Promise<Map<string, string>> {
  const source = blogSource()
  if (source === "empty") return new Map()
  if (source === "fixtures") return new Map(FIXTURE_REDIRECTS.map((r) => [r.fromSlug, r.toSlug]))
  const base = (process.env.SUPABASE_URL ?? "").replace(/\/$/, "")
  const key = process.env.SUPABASE_ANON_KEY ?? ""
  const response = await fetch(`${base}/rest/v1/blog_redirects?select=from_slug,blog_posts(slug)&limit=1000`, {
    headers: { apikey: key, ...(key.startsWith("eyJ") ? { Authorization: `Bearer ${key}` } : {}), Accept: "application/json" },
    cache: "no-store",
  })
  if (!response.ok) throw new Error(`blog_redirects read failed: ${response.status}`)
  const rows = (await response.json()) as { from_slug: string; blog_posts: { slug: string } | null }[]
  return new Map(rows.filter((r) => r.blog_posts?.slug).map((r) => [r.from_slug, r.blog_posts!.slug]))
}

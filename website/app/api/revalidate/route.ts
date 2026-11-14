import { NextResponse, type NextRequest } from "next/server"
import { revalidatePath, revalidateTag } from "next/cache"
import { safeEqual } from "@/lib/blog/secrets"

/**
 * POST /api/revalidate: called by the admin after publish, unpublish, update, slug change, category or author edit
 * (packages/blog-content/README.md). `x-revalidate-secret` must match BLOG_REVALIDATE_SECRET.
 *   200 {"revalidated": true} · 401 wrong secret · 400 bad body
 */
const TAG = /^blog(:(post|category|author):[a-z0-9][a-z0-9._-]*)?$/
const PATHS = ["/blog", "/sitemap.xml", "/llms.txt", "/llms-full.txt"]
const MAX = 50

export async function POST(request: NextRequest) {
  const secret = process.env.BLOG_REVALIDATE_SECRET
  const given = request.headers.get("x-revalidate-secret") ?? ""
  if (!secret || !safeEqual(given, secret)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  let body: { tags?: unknown; paths?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Body must be JSON" }, { status: 400 })
  }
  const tags = body.tags ?? []
  const paths = body.paths ?? []
  const stringsOnly = (v: unknown): v is string[] => Array.isArray(v) && v.length <= MAX && v.every((x) => typeof x === "string")
  if (!stringsOnly(tags) || !stringsOnly(paths) || tags.length + paths.length === 0) {
    return NextResponse.json({ error: "Expected { tags?: string[], paths?: string[] }" }, { status: 400 })
  }
  if (!tags.every((t) => TAG.test(t)) || !paths.every((p) => PATHS.some((allowed) => p === allowed || p.startsWith(`${allowed}/`)))) {
    return NextResponse.json({ error: "Unknown tag or path" }, { status: 400 })
  }

  // Lists (index, archives, feeds, sitemap, llms.txt) are tagged `blog`, so any record change refreshes them too.
  for (const tag of new Set(["blog", ...tags])) revalidateTag(tag, { expire: 0 })
  for (const path of new Set(paths)) revalidatePath(path)
  return NextResponse.json({ revalidated: true })
}

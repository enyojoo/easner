import { draftMode } from "next/headers"
import { NextResponse, type NextRequest } from "next/server"
import { redirect } from "next/navigation"
import { rest } from "@/lib/blog/supabase"
import { verifyPreviewToken } from "@/lib/blog/secrets"

/**
 * GET /api/blog/preview?token=<token>: the admin's "Preview" link. Verifies the signed token (HMAC-SHA256 with
 * BLOG_PREVIEW_SECRET, constant-time, not expired), turns on Next draft mode, looks up the post's slug with the
 * service role and redirects to /blog/<slug>. In draft mode the post page reads `draft_content ?? content` with the
 * service role, shows the "Preview, not published" bar, sends noindex and is never cached.
 * `?exit=1` leaves draft mode.
 */
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const headers = { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" }

export async function GET(request: NextRequest) {
  const draft = await draftMode()
  if (request.nextUrl.searchParams.get("exit") === "1") {
    draft.disable()
    redirect("/blog")
  }

  const secret = process.env.BLOG_PREVIEW_SECRET
  const token = request.nextUrl.searchParams.get("token") ?? ""
  const payload = secret ? verifyPreviewToken(token, secret) : null
  if (!payload || !UUID.test(payload.postId)) {
    return NextResponse.json({ error: "Invalid or expired preview link" }, { status: 401, headers })
  }
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: "Preview is not configured" }, { status: 503, headers })
  }

  let slug: string | undefined
  try {
    const rows = await rest<{ slug: string }[]>("blog_posts", `select=slug&id=eq.${payload.postId}&limit=1`, { role: "service", noStore: true })
    slug = rows[0]?.slug
  } catch (error) {
    console.error("[blog] preview lookup failed", error)
    return NextResponse.json({ error: "Preview lookup failed" }, { status: 502, headers })
  }
  if (!slug) return NextResponse.json({ error: "Post not found" }, { status: 404, headers })

  draft.enable()
  redirect(`/blog/${slug}`)
}

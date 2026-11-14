import { createHash } from "node:crypto"
import { NextResponse, type NextRequest } from "next/server"
import { blogSource } from "@/lib/blog/config"
import { rest } from "@/lib/blog/supabase"

/**
 * POST /api/blog/feedback: "Was this helpful?" (WebPostFeedback). Writes `blog_feedback` with the service role.
 *   body { slug, helpful: boolean, reason?: "out_of_date" | "not_what_i_was_looking_for" | "too_technical" | "missing_my_country" }
 * One vote per visitor per post per day: the visitor hash is sha256(daily salt + IP + user agent + post), the IP is
 * never stored and the salt changes every UTC day. A reason sent after a "No" updates that vote instead of adding one.
 * The browser also remembers its vote (localStorage), which is what makes it one per browser across days.
 */
const REASONS = ["out_of_date", "not_what_i_was_looking_for", "too_technical", "missing_my_country"]
const SLUG = /^[a-z0-9][a-z0-9-]{0,120}$/
const WINDOW_MS = 10 * 60_000
const MAX_PER_WINDOW = 12
const hits = new Map<string, { count: number; reset: number }>()

const sha = (v: string) => createHash("sha256").update(v).digest("hex")

function limited(key: string): boolean {
  const now = Date.now()
  if (hits.size > 5000) for (const [k, v] of hits) if (v.reset < now) hits.delete(k)
  const entry = hits.get(key)
  if (!entry || entry.reset < now) {
    hits.set(key, { count: 1, reset: now + WINDOW_MS })
    return false
  }
  entry.count += 1
  return entry.count > MAX_PER_WINDOW
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin")
  if (origin) {
    try {
      if (new URL(origin).host !== request.headers.get("host")) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    } catch {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
  }

  let body: { slug?: unknown; helpful?: unknown; reason?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Body must be JSON" }, { status: 400 })
  }
  const { slug, helpful, reason } = body
  if (typeof slug !== "string" || !SLUG.test(slug) || typeof helpful !== "boolean") {
    return NextResponse.json({ error: "Expected { slug, helpful }" }, { status: 400 })
  }
  if (reason !== undefined && (typeof reason !== "string" || !REASONS.includes(reason))) {
    return NextResponse.json({ error: "Unknown reason" }, { status: 400 })
  }
  const why = helpful ? null : ((reason as string | undefined) ?? null)

  const ip = (request.headers.get("x-forwarded-for")?.split(",")[0] ?? request.headers.get("x-real-ip") ?? "unknown").trim()
  const day = new Date().toISOString().slice(0, 10)
  const salt = sha(`${process.env.BLOG_FEEDBACK_SECRET ?? process.env.SUPABASE_SERVICE_ROLE_KEY ?? "dev"}|${day}`)
  if (limited(sha(`${salt}|${ip}`))) return NextResponse.json({ error: "Too many requests" }, { status: 429 })

  const source = blogSource()
  if (source !== "supabase" || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    // Fixtures and unconfigured builds accept the vote and store nothing.
    return NextResponse.json({ ok: true, stored: false })
  }

  try {
    const posts = await rest<{ id: string }[]>("blog_posts", `select=id&slug=eq.${encodeURIComponent(slug)}&limit=1`, { noStore: true })
    const postId = posts[0]?.id
    if (!postId) return NextResponse.json({ error: "Post not found" }, { status: 404 })

    const visitorHash = sha(`${salt}|${ip}|${request.headers.get("user-agent") ?? ""}|${postId}`)
    const existing = await rest<{ id: number; helpful: boolean; reason: string | null }[]>(
      "blog_feedback",
      `select=id,helpful,reason&post_id=eq.${postId}&visitor_hash=eq.${visitorHash}&limit=1`,
      { role: "service", noStore: true },
    )
    const vote = existing[0]
    if (vote) {
      if (why && vote.helpful === false && !vote.reason) {
        await rest("blog_feedback", `id=eq.${vote.id}`, { role: "service", method: "PATCH", body: { reason: why } })
      }
      return NextResponse.json({ ok: true, stored: false })
    }
    await rest("blog_feedback", "", {
      role: "service",
      method: "POST",
      body: { post_id: postId, helpful, reason: why, visitor_hash: visitorHash },
      prefer: "return=minimal",
    })
    return NextResponse.json({ ok: true, stored: true })
  } catch (error) {
    console.error("[blog] feedback failed", error)
    return NextResponse.json({ error: "Could not save feedback" }, { status: 502 })
  }
}

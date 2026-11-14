import { NextResponse, type NextRequest } from "next/server"
import { aiAllFaqs } from "@/lib/marketing/content/ai"
import { searchPosts } from "@/lib/blog/queries"

/**
 * Blog search for the ⌘K dialog: Postgres full-text search on the `search` column (title, excerpt, plain-text body),
 * plus matching questions from /answers. The result is cached at the CDN for 5 minutes, and the read itself is in
 * Next's data cache under the `blog` tag, so a publish refreshes it.
 */
export async function GET(request: NextRequest) {
  const q = (request.nextUrl.searchParams.get("q") ?? "").trim().slice(0, 100)
  if (q.length < 2) return NextResponse.json({ posts: [], answers: [] })
  const words = q.toLowerCase().split(/\s+/).filter((w) => w.length > 1)
  const [posts] = await Promise.all([searchPosts(q)])
  const answers = aiAllFaqs
    .filter((faq) => words.length > 0 && words.every((w) => faq.question.toLowerCase().includes(w)))
    .slice(0, 3)
    .map((faq) => ({ question: faq.question, href: "/answers" }))
  return NextResponse.json(
    { posts, answers },
    { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } },
  )
}

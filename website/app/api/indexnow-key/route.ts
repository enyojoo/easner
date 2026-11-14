/**
 * GET /api/indexnow-key: the IndexNow ownership key as plain text, so the admin's ping can name this URL as its
 * `keyLocation`. An empty 404 when INDEXNOW_KEY is not set.
 */
export const dynamic = "force-dynamic"

export function GET() {
  const key = process.env.INDEXNOW_KEY?.trim()
  if (!key) return new Response(null, { status: 404 })
  return new Response(key, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" } })
}

/**
 * The IndexNow ownership key as plain text. IndexNow verifies a ping by fetching `https://<host>/<key>.txt`, so
 * next.config.mjs rewrites `/<key>.txt` here; the handler answers only when the requested key is the real one
 * (anything else is a 404, so no other `.txt` path is served). `/api/indexnow-key` itself answers too, for checking the
 * setup by hand. An empty 404 when INDEXNOW_KEY is not set.
 */
export const dynamic = "force-dynamic"

export function GET(request: Request) {
  const key = process.env.INDEXNOW_KEY?.trim()
  if (!key) return new Response(null, { status: 404 })
  const asked = new URL(request.url).searchParams.get("key")
  if (asked !== null && asked !== key) return new Response(null, { status: 404 })
  return new Response(key, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" } })
}

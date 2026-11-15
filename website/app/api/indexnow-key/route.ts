/**
 * The IndexNow ownership key as plain text, for checking the setup by hand. IndexNow itself fetches `/<key>.txt`
 * (next.config.mjs rewrites that to `./[key]/route.ts`). An empty 404 when INDEXNOW_KEY is not set.
 */
export const dynamic = "force-dynamic"

export function GET() {
  const key = process.env.INDEXNOW_KEY?.trim()
  if (!key) return new Response(null, { status: 404 })
  return new Response(key, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" } })
}

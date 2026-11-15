/**
 * `/<key>.txt` (rewritten here by next.config.mjs): IndexNow verifies a ping by fetching the key file at the site root.
 * Answers only when the requested key is the real INDEXNOW_KEY; any other `.txt` name is a 404.
 */
export const dynamic = "force-dynamic"

export async function GET(_request: Request, { params }: { params: Promise<{ key: string }> }) {
  const key = process.env.INDEXNOW_KEY?.trim()
  const { key: asked } = await params
  if (!key || asked !== key) return new Response(null, { status: 404 })
  return new Response(key, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" } })
}

import type { DocNode } from "@easner/blog-content"
import { isCronAuthorized, publishDue } from "@/lib/blog/scheduled-publish"
import { loadSiteRow, pingIndexNow, revalidateWebsite, secretClient, siteChange } from "@/lib/server/blog-server"

export const dynamic = "force-dynamic"
export const maxDuration = 60

/**
 * Publishes scheduled posts that are due. Vercel Cron calls it every 5 minutes (vercel.json) with
 * `Authorization: Bearer $CRON_SECRET`. It acts with the secret key: `publish_post` accepts a post that is scheduled and
 * due, on behalf of the Editor who scheduled it, and refuses anything else, so calling it twice is harmless. After each
 * publish it runs the same website revalidation and IndexNow ping as a manual publish.
 */
async function run(request: Request) {
  if (!process.env.CRON_SECRET) return Response.json({ error: "CRON_SECRET isn’t set." }, { status: 503 })
  if (!isCronAuthorized(request.headers.get("authorization"), process.env.CRON_SECRET)) {
    return Response.json({ error: "Not allowed." }, { status: 401 })
  }
  const client = secretClient()
  if (!client) return Response.json({ error: "NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY isn’t set." }, { status: 503 })

  const result = await publishDue({
    async listDue() {
      const { data, error } = await client
        .from("blog_posts")
        .select("id, slug")
        .eq("status", "scheduled")
        .lte("scheduled_for", new Date().toISOString())
        .order("scheduled_for", { ascending: true })
        .limit(50)
      if (error) throw new Error(error.message)
      return (data ?? []) as Array<{ id: string; slug: string }>
    },
    async loadDoc(id) {
      const { data } = await client.from("blog_posts").select("draft_content, content").eq("id", id).maybeSingle()
      return ((data?.draft_content ?? data?.content) as DocNode | null) ?? null
    },
    async publish(id, derived) {
      const { error } = await client.rpc("publish_post", {
        p_post_id: id,
        p_significant_update: true,
        p_content_text: derived.contentText,
        p_word_count: derived.wordCount,
        p_reading_minutes: derived.readingMinutes,
        p_summary: derived.summary,
      })
      return error ? { ok: false, code: error.code, message: error.message } : { ok: true }
    },
    async notify(id) {
      const row = await loadSiteRow(client, id)
      if (!row) return { status: "failed", note: "The post couldn’t be read back." }
      const website = await revalidateWebsite(siteChange(row, { kind: "publish" }))
      await pingIndexNow(row.slug)
      return website
    },
  })

  return Response.json(result, { status: result.failed.length ? 207 : 200 })
}

export const GET = run
export const POST = run

import { validateDoc, type DocNode } from "@easner/blog-content"
import { prepareSave } from "@/lib/blog/derive"
import { loadSiteRow, pingIndexNow, revalidateWebsite, siteChange, verifiedClient, type SiteRow } from "@/lib/server/blog-server"

export const dynamic = "force-dynamic"

type Body = { action?: string; postId?: string; significant?: boolean; oldSlug?: string; oldCategorySlug?: string }

function failure(message: string, status = 400) {
  return Response.json({ error: message }, { status })
}

/** Database errors are written for people already; permission errors become one calm sentence. */
function readable(message: string): string {
  return /row-level security|permission denied/i.test(message) ? "You don’t have permission to do that." : message
}

export async function POST(request: Request) {
  const auth = await verifiedClient(request)
  if (auth instanceof Response) return auth
  const { client } = auth

  let body: Body
  try {
    body = (await request.json()) as Body
  } catch {
    return failure("That request wasn’t understood.")
  }
  const postId = body.postId
  if (!postId || typeof postId !== "string") return failure("Which post?")

  const load = async () => {
    const row: SiteRow | null = await loadSiteRow(client, postId)
    return { row }
  }

  switch (body.action) {
    case "publish": {
      const { data: source, error: loadError } = await client
        .from("blog_posts")
        .select("draft_content, content, status, published_at")
        .eq("id", postId)
        .maybeSingle()
      if (loadError || !source) return failure("That post couldn’t be found.", 404)
      const doc = (source.draft_content ?? source.content) as DocNode | null
      if (!doc) return failure("This post has no content yet.")
      const prepared = prepareSave({ doc })
      if (!prepared.ok) {
        const first = validateDoc(doc).find((issue) => issue.severity === "error")
        return failure(`Fix the content before publishing: ${first?.message ?? "the post has an invalid block."}`)
      }
      const { error } = await client.rpc("publish_post", {
        p_post_id: postId,
        p_significant_update: body.significant !== false,
        p_content_text: prepared.derived.contentText,
        p_word_count: prepared.derived.wordCount,
        p_reading_minutes: prepared.derived.readingMinutes,
        p_summary: prepared.derived.summary,
      })
      if (error) return failure(readable(error.message), error.code === "42501" ? 403 : 400)
      const { row } = await load()
      if (!row) return failure("Published, but the post couldn’t be read back.", 500)
      const website = await revalidateWebsite(siteChange(row, { kind: source.published_at ? "update" : "publish" }))
      await pingIndexNow(row.slug)
      return Response.json({ website })
    }
    case "unpublish":
    case "archive": {
      const { row: before } = await load()
      const { error } = await client.rpc(body.action === "unpublish" ? "unpublish_post" : "archive_post", { p_post_id: postId })
      if (error) return failure(readable(error.message), error.code === "42501" ? 403 : 400)
      const website = before && before.status === "published" ? await revalidateWebsite(siteChange(before, { kind: "unpublish" })) : { status: "ok" as const }
      return Response.json({ website })
    }
    case "unarchive": {
      const { error } = await client.rpc("unarchive_post", { p_post_id: postId })
      if (error) return failure(readable(error.message), error.code === "42501" ? 403 : 400)
      return Response.json({ website: { status: "ok" } })
    }
    case "delete": {
      const { data: found } = await client.from("blog_posts").select("status").eq("id", postId).maybeSingle()
      if (!found) return failure("That post couldn’t be found.", 404)
      if (found.status === "published") return failure("A live post can’t be deleted. Archive it first.", 409)
      const { data: removed, error } = await client.from("blog_posts").delete().eq("id", postId).select("id")
      if (error) return failure(readable(error.message), error.code === "42501" ? 403 : 400)
      // Row-level security hides rows you can't delete: nothing removed means no permission.
      if (!removed?.length) return failure("You don’t have permission to delete this post.", 403)
      return Response.json({ website: { status: "ok" } })
    }
    case "revalidate": {
      // A slug, category or author change on a live post.
      const { row } = await load()
      if (!row) return failure("That post couldn’t be found.", 404)
      if (row.status !== "published") return Response.json({ website: { status: "ok" } })
      const website = await revalidateWebsite(
        siteChange(row, { oldSlug: body.oldSlug, oldCategorySlug: body.oldCategorySlug, kind: body.oldSlug ? "slug" : "category" }),
      )
      return Response.json({ website })
    }
    default:
      return failure("That action isn’t supported.")
  }
}

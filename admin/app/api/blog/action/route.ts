import { validateDoc, type DocNode } from "@easner/blog-content"
import { prepareSave } from "@/lib/blog/derive"
import { pingIndexNow, revalidateWebsite, verifiedClient } from "@/lib/server/blog-server"

export const dynamic = "force-dynamic"

type Body = { action?: string; postId?: string; significant?: boolean; oldSlug?: string; oldCategorySlug?: string }

const POST_FOR_SITE = "id, slug, status, category_id, blog_categories(slug), blog_post_authors(blog_authors(slug))"

type SiteRow = {
  id: string
  slug: string
  status: string
  blog_categories: { slug: string } | { slug: string }[] | null
  blog_post_authors: Array<{ blog_authors: { slug: string } | { slug: string }[] | null }> | null
}

const first = <T,>(value: T | T[] | null | undefined): T | null => (Array.isArray(value) ? (value[0] ?? null) : (value ?? null))

function siteChange(row: SiteRow, extra: { oldSlug?: string; oldCategorySlug?: string; kind: "publish" | "update" | "unpublish" | "slug" | "category" | "author" }) {
  return {
    slug: row.slug,
    oldSlug: extra.oldSlug && extra.oldSlug !== row.slug ? extra.oldSlug : undefined,
    categorySlug: first(row.blog_categories)?.slug,
    oldCategorySlug: extra.oldCategorySlug,
    authorSlugs: (row.blog_post_authors ?? []).map((link) => first(link.blog_authors)?.slug).filter((s): s is string => Boolean(s)),
    kind: extra.kind,
  }
}

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
    const { data, error } = await client.from("blog_posts").select(POST_FOR_SITE).eq("id", postId).maybeSingle()
    return { row: data as unknown as SiteRow | null, error }
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

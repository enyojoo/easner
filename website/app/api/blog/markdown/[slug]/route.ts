import { notFound } from "next/navigation"
import { getPost, getPostSlugs } from "@/lib/blog/queries"
import { postToMarkdown } from "@/lib/blog/markdown"
import { abs, postPath } from "@/lib/blog/urls"

/**
 * The Markdown version of a post. Next can't use "[slug].md" as a route segment, so next.config.mjs rewrites
 * /blog/<slug>.md to this handler; the public URL stays /blog/<slug>.md (linked from the post as
 * `<link rel="alternate" type="text/markdown">`).
 */
export const revalidate = 3600

export async function generateStaticParams() {
  return (await getPostSlugs()).map((slug) => ({ slug }))
}

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) notFound()
  const url = abs(postPath(slug))
  return new Response(postToMarkdown(post, { url }), {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=900, s-maxage=3600, stale-while-revalidate=86400",
      // The HTML page is the canonical URL; this is a machine-readable twin of it.
      Link: `<${url}>; rel="canonical"`,
    },
  })
}

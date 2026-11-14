import { notFound } from "next/navigation"
import { buildFeed, feedResponse } from "@/lib/blog/feed"
import { getAuthor, getAuthors, getPostsByAuthor } from "@/lib/blog/queries"
import { authorPath } from "@/lib/blog/urls"

export const revalidate = 3600

export async function generateStaticParams() {
  return (await getAuthors()).map((a) => ({ slug: a.slug }))
}

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const author = await getAuthor(slug)
  if (!author) notFound()
  return feedResponse(
    await buildFeed({
      title: `Easner Blog – posts by ${author.name}`,
      description: `Posts by ${author.name} on the Easner blog.`,
      path: authorPath(slug),
      posts: await getPostsByAuthor(author.id),
    }),
  )
}

import { notFound } from "next/navigation"
import { buildFeed, feedResponse } from "@/lib/blog/feed"
import { getCategories, getCategory, getPostsByCategory } from "@/lib/blog/queries"
import { categoryPath } from "@/lib/blog/urls"

export const revalidate = 3600

export async function generateStaticParams() {
  return (await getCategories()).map((c) => ({ slug: c.slug }))
}

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const category = await getCategory(slug)
  if (!category) notFound()
  return feedResponse(
    await buildFeed({
      title: `Easner Blog – ${category.name}`,
      description: category.description ?? `Easner blog posts about ${category.name}.`,
      path: categoryPath(slug),
      posts: await getPostsByCategory(category.id),
    }),
  )
}

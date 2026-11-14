import { notFound } from "next/navigation"
import { CategoryView } from "@/components/blog/category-view"
import { POSTS_PER_PAGE } from "@/lib/blog/config"
import { getCategories, getCategory, isThinArchive } from "@/lib/blog/queries"
import { categoryMeta } from "@/lib/blog/seo-text"
import { abs, categoryPath, pagePath } from "@/lib/blog/urls"
import { marketingMetadata } from "@/lib/marketing/metadata"

/** `/blog/categories/<slug>?page=N`, rewritten here by proxy.ts. See app/(marketing)/blog/page/[n]. */
export const revalidate = 3600

export async function generateStaticParams() {
  return (await getCategories()).flatMap((c) =>
    Array.from({ length: Math.max(0, Math.ceil(c.postCount / POSTS_PER_PAGE) - 1) }, (_, i) => ({ slug: c.slug, n: String(i + 2) })),
  )
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string; n: string }> }) {
  const { slug, n } = await params
  const category = await getCategory(slug)
  if (!category) notFound()
  const page = Number(n)
  return marketingMetadata({
    metadata: categoryMeta(category, page),
    path: pagePath(categoryPath(slug), page),
    noindex: isThinArchive(category.postCount),
    images: [{ url: abs(`${categoryPath(slug)}/opengraph-image`), alt: `Easner Blog – ${category.name}` }],
    alternateTypes: { "application/rss+xml": `${categoryPath(slug)}/feed.xml` },
  })
}

export default async function CategoryPageN({ params }: { params: Promise<{ slug: string; n: string }> }) {
  const { slug, n } = await params
  const page = Number(n)
  if (!Number.isInteger(page) || page < 2) notFound()
  return <CategoryView slug={slug} page={page} />
}

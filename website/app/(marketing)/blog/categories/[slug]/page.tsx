import { notFound } from "next/navigation"
import { CategoryView } from "@/components/blog/category-view"
import { getCategories, getCategory, isThinArchive } from "@/lib/blog/queries"
import { categoryMeta } from "@/lib/blog/seo-text"
import { abs, categoryPath } from "@/lib/blog/urls"
import { marketingMetadata } from "@/lib/marketing/metadata"

export const revalidate = 3600

export async function generateStaticParams() {
  return (await getCategories()).map((c) => ({ slug: c.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const category = await getCategory(slug)
  if (!category) notFound()
  const meta = categoryMeta(category, 1)
  return marketingMetadata({
    metadata: meta,
    path: categoryPath(slug),
    // A thin archive (too few posts to be useful) stays out of the index until it grows.
    noindex: isThinArchive(category.postCount),
    images: [{ url: abs(`${categoryPath(slug)}/opengraph-image`), alt: `Easner Blog – ${category.name}` }],
    alternateTypes: { "application/rss+xml": `${categoryPath(slug)}/feed.xml` },
  })
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  return <CategoryView slug={slug} page={1} />
}

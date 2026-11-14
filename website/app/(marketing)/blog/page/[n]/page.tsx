import { notFound } from "next/navigation"
import { IndexView, INDEX_DESCRIPTION } from "@/components/blog/index-view"
import { POSTS_PER_PAGE } from "@/lib/blog/config"
import { getAllPosts, pickFeatured } from "@/lib/blog/queries"
import { abs, pagePath } from "@/lib/blog/urls"
import { marketingMetadata } from "@/lib/marketing/metadata"

/**
 * `/blog?page=N` is served from here: proxy.ts rewrites the query string to this static route, so every page of the
 * index is ISR HTML with its own title and a self-canonical on the `?page=N` URL. A direct request to
 * /blog/page/N redirects back to `?page=N`.
 */
export const revalidate = 3600

export async function generateStaticParams() {
  const all = await getAllPosts()
  const rest = all.length - pickFeatured(all).length
  return Array.from({ length: Math.max(0, Math.ceil(rest / POSTS_PER_PAGE) - 1) }, (_, i) => ({ n: String(i + 2) }))
}

export async function generateMetadata({ params }: { params: Promise<{ n: string }> }) {
  const { n } = await params
  const page = Number(n)
  return marketingMetadata({
    metadata: { title: `Blog – page ${page}`, description: `${INDEX_DESCRIPTION} Page ${page}.` },
    path: pagePath("/blog", page),
    images: [{ url: abs("/blog/opengraph-image"), alt: "Easner Blog – Notes on moving money" }],
    alternateTypes: { "application/rss+xml": "/blog/feed.xml" },
  })
}

export default async function BlogIndexPageN({ params }: { params: Promise<{ n: string }> }) {
  const { n } = await params
  const page = Number(n)
  if (!Number.isInteger(page) || page < 2) notFound()
  return <IndexView page={page} />
}

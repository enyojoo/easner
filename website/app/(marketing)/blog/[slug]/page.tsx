import { notFound } from "next/navigation"
import { draftMode } from "next/headers"
import { PostView, postDateModified, postDescription } from "@/components/blog/post-view"
import { getPost, getPostSlugs } from "@/lib/blog/queries"
import { abs, authorPath, markdownPath, postPath, shareImageUrl } from "@/lib/blog/urls"
import { marketingMetadata } from "@/lib/marketing/metadata"

export const revalidate = 3600

export async function generateStaticParams() {
  return (await getPostSlugs()).map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const { isEnabled: draft } = await draftMode()
  const post = await getPost(slug, { draft })
  if (!post) notFound()
  const title = post.seoTitle ?? post.title
  return marketingMetadata({
    metadata: { title, description: postDescription(post), keywords: post.focusKeyword ? [post.focusKeyword] : undefined },
    path: postPath(slug),
    canonical: post.canonicalUrl ?? undefined,
    // A title that already says "Easner" is used as is, so the brand appears once, not "… – Easner" twice.
    titleAbsolute: title.includes("Easner") ? title : undefined,
    noindex: post.noindex || draft,
    article: {
      publishedTime: post.publishedAt,
      modifiedTime: postDateModified(post),
      authors: post.authors.map((a) => abs(authorPath(a.slug))),
      section: post.category.name,
    },
    images: [{ url: shareImageUrl(post), alt: post.coverAlt ?? post.title }],
    alternateTypes: { "application/rss+xml": "/blog/feed.xml", "text/markdown": markdownPath(slug) },
  })
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const { isEnabled: draft } = await draftMode()
  if (!slug) notFound()
  return <PostView slug={slug} draft={draft} />
}

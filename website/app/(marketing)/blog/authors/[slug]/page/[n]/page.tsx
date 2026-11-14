import { notFound } from "next/navigation"
import { AuthorView } from "@/components/blog/author-view"
import { POSTS_PER_PAGE } from "@/lib/blog/config"
import { getAuthor, getAuthors } from "@/lib/blog/queries"
import { authorMeta } from "@/lib/blog/seo-text"
import { abs, authorPath, pagePath } from "@/lib/blog/urls"
import { marketingMetadata } from "@/lib/marketing/metadata"

/** `/blog/authors/<slug>?page=N`, rewritten here by proxy.ts. See app/(marketing)/blog/page/[n]. */
export const revalidate = 3600

export async function generateStaticParams() {
  return (await getAuthors()).flatMap((a) =>
    Array.from({ length: Math.max(0, Math.ceil(a.postCount / POSTS_PER_PAGE) - 1) }, (_, i) => ({ slug: a.slug, n: String(i + 2) })),
  )
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string; n: string }> }) {
  const { slug, n } = await params
  const author = await getAuthor(slug)
  if (!author) notFound()
  const page = Number(n)
  const [firstName, ...rest] = author.name.split(" ")
  return marketingMetadata({
    metadata: authorMeta(author, page),
    path: pagePath(authorPath(slug), page),
    profile: { firstName, lastName: rest.join(" ") || undefined },
    images: [{ url: abs(`${authorPath(slug)}/opengraph-image`), alt: `Easner Blog – posts by ${author.name}` }],
    alternateTypes: { "application/rss+xml": `${authorPath(slug)}/feed.xml` },
  })
}

export default async function AuthorPageN({ params }: { params: Promise<{ slug: string; n: string }> }) {
  const { slug, n } = await params
  const page = Number(n)
  if (!Number.isInteger(page) || page < 2) notFound()
  return <AuthorView slug={slug} page={page} />
}

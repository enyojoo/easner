import { notFound } from "next/navigation"
import { AuthorView } from "@/components/blog/author-view"
import { getAuthor, getAuthors } from "@/lib/blog/queries"
import { authorMeta } from "@/lib/blog/seo-text"
import { abs, authorPath } from "@/lib/blog/urls"
import { marketingMetadata } from "@/lib/marketing/metadata"

export const revalidate = 3600

export async function generateStaticParams() {
  return (await getAuthors()).map((a) => ({ slug: a.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const author = await getAuthor(slug)
  if (!author) notFound()
  const [firstName, ...rest] = author.name.split(" ")
  return marketingMetadata({
    metadata: authorMeta(author, 1),
    path: authorPath(slug),
    // A set-up profile with no posts yet is public, but a page with nothing on it stays out of search.
    noindex: author.postCount === 0,
    profile: { firstName, lastName: rest.join(" ") || undefined },
    images: [{ url: abs(`${authorPath(slug)}/opengraph-image`), alt: `Easner Blog – posts by ${author.name}` }],
    alternateTypes: { "application/rss+xml": `${authorPath(slug)}/feed.xml` },
  })
}

export default async function AuthorPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  return <AuthorView slug={slug} page={1} />
}

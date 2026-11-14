import { notFound } from "next/navigation"
import { getPost, getPostSlugs } from "@/lib/blog/queries"
import { shareImageResponse } from "@/lib/blog/share-card"

/**
 * The share image (og:image, twitter:image) for a post, served from www.easner.com: `og_image_path` if set, else the
 * cover, cropped to 1200×630 around `cover_focal_point`, else the text card. The `?v=<hash>` on the URL changes
 * with the cover so platforms re-fetch after a change.
 */
export const revalidate = 3600

export async function generateStaticParams() {
  return (await getPostSlugs()).map((slug) => ({ slug }))
}

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) notFound()
  return shareImageResponse(
    { path: post.ogImagePath ?? post.coverPath, focal: post.ogImagePath ? null : post.coverFocal },
    { label: post.category.name, title: post.title },
  )
}

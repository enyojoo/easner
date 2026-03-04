import { notFound } from "next/navigation"
import { PublicHeader } from "@/components/layout/public-header"
import { PublicFooter } from "@/components/layout/public-footer"
import { getPostBySlug } from "@/lib/blog-service"
import { BlogPostContent } from "@/components/blog/blog-post-content"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) {
    return { title: "Post Not Found" }
  }
  return {
    title: `${post.title} - Easner Blog`,
    description: post.excerpt || post.title,
  }
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = await getPostBySlug(slug)

  if (!post) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-white">
      <PublicHeader />
      <main style={{ paddingTop: "4.5rem" }}>
        <BlogPostContent post={post} />
      </main>
      <PublicFooter />
    </div>
  )
}

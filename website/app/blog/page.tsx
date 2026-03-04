import { PublicHeader } from "@/components/layout/public-header"
import { PublicFooter } from "@/components/layout/public-footer"
import { getPublishedPosts, getTopics } from "@/lib/blog-service"
import { BlogIndex } from "@/components/blog/blog-index"

export const metadata = {
  title: "Blog - Easner",
  description: "Insights for global payments. Product updates, compliance, and cross-border stablecoin banking.",
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ topic?: string }>
}) {
  const { topic } = await searchParams
  const [posts, topics] = await Promise.all([
    getPublishedPosts({ limit: 50, topicSlug: topic }),
    getTopics(),
  ])

  return (
    <div className="min-h-screen bg-white">
      <PublicHeader />
      <main style={{ paddingTop: "4.5rem" }}>
        <BlogIndex posts={posts} topics={topics} topicFilter={topic} />
      </main>
      <PublicFooter />
    </div>
  )
}

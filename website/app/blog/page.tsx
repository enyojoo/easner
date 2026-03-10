import { PublicHeader } from "@/components/layout/public-header"
import { PublicFooter } from "@/components/layout/public-footer"
import { getPublishedPosts } from "@/lib/blog-service"
import { BLOG_TOPICS } from "@easner/shared"
import { BlogIndex } from "@/components/blog/blog-index"

export const metadata = {
  title: "Blog - Easner",
  description:
    "Insights on the future of banking. The latest updates on Easner, the world of stablecoins and finance.",
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ topic?: string }>
}) {
  const { topic } = await searchParams

  if (topic) {
    const [topicPosts, ...otherTopicPosts] = await Promise.all([
      getPublishedPosts({ topicSlug: topic, limit: 6 }),
      ...BLOG_TOPICS.filter((t) => t.slug !== topic).map((t) =>
        getPublishedPosts({ topicSlug: t.slug, limit: 100 })
      ),
    ])
    const topicConfig = BLOG_TOPICS.find((t) => t.slug === topic)
    const otherTopics = BLOG_TOPICS.filter((t) => t.slug !== topic).map((t, i) => ({
      slug: t.slug,
      name: t.name,
      posts: otherTopicPosts[i] || [],
    }))

    return (
      <div className="min-h-screen bg-white">
        <PublicHeader />
        <main style={{ paddingTop: "4.5rem" }}>
          <BlogIndex
            topicFilter={topic}
            topicHeading={topicConfig?.heading ?? topicConfig?.name ?? topic}
            topicPosts={topicPosts}
            otherTopics={otherTopics}
            topicsWithPosts={[topic, ...otherTopics.filter((t) => t.posts.length > 0).map((t) => t.slug)]}
          />
        </main>
        <PublicFooter />
      </div>
    )
  }

  const allPosts = await getPublishedPosts({ limit: 100 })
  const featuredIds = new Set(allPosts.slice(0, 4).map((p) => p.id))
  const remainingPosts = allPosts.slice(4)

  const postsByTopic: Record<string, typeof allPosts> = {}
  for (const post of remainingPosts) {
    const slug = post.topic?.slug
    if (slug) {
      if (!postsByTopic[slug]) postsByTopic[slug] = []
      postsByTopic[slug].push(post)
    }
  }

  // Topics with at least one post (from all posts) - show alongside "All" in tabs
  const topicSlugsWithPosts = new Set<string>()
  for (const post of allPosts) {
    const slug = post.topic?.slug
    if (slug) topicSlugsWithPosts.add(slug)
  }
  const topicsWithPosts = BLOG_TOPICS.filter((t) => topicSlugsWithPosts.has(t.slug)).map(
    (t) => t.slug
  )

  const topicSections = BLOG_TOPICS.filter((t) => (postsByTopic[t.slug]?.length ?? 0) > 0).map(
    (t) => ({
      slug: t.slug,
      name: t.name,
      posts: postsByTopic[t.slug] || [],
    })
  )

  return (
    <div className="min-h-screen bg-white">
      <PublicHeader />
      <main style={{ paddingTop: "4.5rem" }}>
        <BlogIndex
          featuredPosts={allPosts.slice(0, 4)}
          topicSections={topicSections}
          topicsWithPosts={topicsWithPosts}
          allPosts={allPosts}
        />
      </main>
      <PublicFooter />
    </div>
  )
}

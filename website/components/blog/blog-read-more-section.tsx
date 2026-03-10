"use client"

import { BlogTopicSection } from "./blog-topic-section"
import type { BlogPost } from "@/lib/blog-service"

interface TopicPosts {
  slug: string
  name: string
  posts: BlogPost[]
}

interface BlogReadMoreSectionProps {
  topics: TopicPosts[]
  currentTopicSlug?: string
}

export function BlogReadMoreSection({ topics, currentTopicSlug }: BlogReadMoreSectionProps) {
  const filteredTopics = currentTopicSlug
    ? topics.filter((t) => t.slug !== currentTopicSlug)
    : topics

  if (filteredTopics.length === 0) return null

  return (
    <section className="mb-16 md:mb-24">
      <h2 className="text-3xl font-bold text-gray-900 font-unbounded mb-2">
        Read more from Easner
      </h2>
      <p className="text-gray-500 mb-12">
        Explore more stories, insights, and updates from the Easner team
      </p>
      <div className="space-y-16">
        {filteredTopics.map((topic) => (
          <BlogTopicSection
            key={topic.slug}
            topicName={topic.name}
            topicSlug={topic.slug}
            posts={topic.posts}
          />
        ))}
      </div>
    </section>
  )
}

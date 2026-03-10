"use client"

import Link from "next/link"
import { BlogPostRow } from "./blog-post-row"
import type { BlogPost } from "@/lib/blog-service"

interface BlogTopicSectionProps {
  topicName: string
  topicSlug: string
  posts: BlogPost[]
}

export function BlogTopicSection({ topicName, topicSlug, posts }: BlogTopicSectionProps) {
  if (posts.length === 0) return null

  return (
    <section className="mb-16 md:mb-24">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 font-unbounded">{topicName}</h2>
        <Link
          href={`/blog?topic=${topicSlug}`}
          className="text-sm font-medium text-easner-primary hover:text-easner-primary-600 transition-colors"
        >
          See All Posts →
        </Link>
      </div>
      <div className="grid sm:grid-cols-2 gap-6 md:gap-8">
        {posts.map((post) => (
          <BlogPostRow key={post.id} post={post} />
        ))}
      </div>
    </section>
  )
}

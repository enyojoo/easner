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
    <section className="mb-12 sm:mb-16 md:mb-24">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 font-unbounded">{topicName}</h2>
        <Link
          href={`/blog?topic=${topicSlug}`}
          className="text-sm font-medium text-easner-primary hover:text-easner-primary-600 transition-colors"
        >
          See All Posts &gt;
        </Link>
      </div>
      <div className="grid sm:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
        {posts.map((post) => (
          <BlogPostRow key={post.id} post={post} />
        ))}
      </div>
    </section>
  )
}

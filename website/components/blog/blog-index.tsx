"use client"

import Link from "next/link"
import { PostCard } from "./post-card"
import { TopicGrid } from "./topic-grid"
import type { BlogPost, BlogTopic } from "@/lib/blog-service"

interface BlogIndexProps {
  posts: BlogPost[]
  topics: BlogTopic[]
  topicFilter?: string
}

export function BlogIndex({ posts, topics, topicFilter }: BlogIndexProps) {
  const featuredPosts = topicFilter ? [] : posts.slice(0, 6)
  const remainingPosts = topicFilter ? posts : posts.slice(6)

  return (
    <div className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero */}
        <section className="mb-16 md:mb-24">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 font-unbounded mb-4">
            Insights for global payments
          </h1>
          <p className="text-lg sm:text-xl text-gray-500 max-w-2xl">
            Product updates, compliance, and cross-border stablecoin banking.
          </p>
        </section>

        {/* Featured posts */}
        {featuredPosts.length > 0 && (
          <section className="mb-16 md:mb-24">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 font-unbounded">Featured</h2>
              <Link
                href="/blog"
                className="text-sm font-medium text-easner-primary hover:text-easner-primary-600 transition-colors"
              >
                Read All Stories
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {featuredPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          </section>
        )}

        {/* Topic grid */}
        {topics.length > 0 && !topicFilter && (
          <section className="mb-16 md:mb-24">
            <TopicGrid topics={topics} />
          </section>
        )}

        {topicFilter && (
          <p className="mb-8 text-gray-500">
            Filtering by topic. <Link href="/blog" className="text-easner-primary hover:underline">Clear filter</Link>
          </p>
        )}

        {/* All posts */}
        {remainingPosts.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-gray-900 font-unbounded mb-8">All Stories</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {remainingPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          </section>
        )}

        {/* Empty state */}
        {posts.length === 0 && (
          <section className="py-16 text-center">
            <p className="text-gray-500 text-lg">No posts yet. Check back soon.</p>
          </section>
        )}
      </div>
    </div>
  )
}

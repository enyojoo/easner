"use client"

import { useState } from "react"
import { BlogPostRow } from "./blog-post-row"
import type { BlogPost } from "@/lib/blog-service"

interface BlogTopicPostsProps {
  topicSlug: string
  initialPosts: BlogPost[]
}

export function BlogTopicPosts({ topicSlug, initialPosts }: BlogTopicPostsProps) {
  const [posts, setPosts] = useState(initialPosts)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(initialPosts.length >= 6)

  async function loadMore() {
    setLoading(true)
    const nextPage = page + 1
    const res = await fetch(
      `/api/blog/posts?topic=${topicSlug}&page=${nextPage}&limit=6`
    )
    const newPosts: BlogPost[] = await res.json()
    setPosts((prev) => [...prev, ...newPosts])
    setPage(nextPage)
    setHasMore(newPosts.length >= 6)
    setLoading(false)
  }

  return (
    <div className="mb-12 sm:mb-16 md:mb-24">
      <div className="grid sm:grid-cols-2 gap-4 sm:gap-5 md:gap-6 mb-6 sm:mb-8">
        {posts.map((post) => (
          <BlogPostRow key={post.id} post={post} />
        ))}
      </div>
      {hasMore && (
        <div className="flex justify-center">
          <button
            onClick={loadMore}
            disabled={loading}
            className="px-5 sm:px-6 py-2.5 rounded-full border-2 border-gray-900 text-gray-900 text-sm sm:text-base font-medium hover:bg-gray-900 hover:text-white transition-colors disabled:opacity-50"
          >
            {loading ? "Loading..." : "Show More"}
          </button>
        </div>
      )}
    </div>
  )
}

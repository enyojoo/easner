"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Search, Rss } from "lucide-react"
import { BLOG_TOPICS } from "@easner/shared"
import { BlogFeaturedBlock } from "./blog-featured-block"
import { BlogTopicSection } from "./blog-topic-section"
import { BlogTopicPosts } from "./blog-topic-posts"
import { BlogReadMoreSection } from "./blog-read-more-section"
import { BlogSearchDialog } from "./blog-search-dialog"
import type { BlogPost } from "@/lib/blog-service"

interface TopicSection {
  slug: string
  name: string
  posts: BlogPost[]
}

type BlogIndexProps =
  | {
      featuredPosts: BlogPost[]
      topicSections: TopicSection[]
      topicsWithPosts: string[]
      allPosts: BlogPost[]
    }
  | {
      topicFilter: string
      topicHeading: string
      topicPosts: BlogPost[]
      otherTopics: TopicSection[]
      topicsWithPosts: string[]
      allPosts?: BlogPost[]
    }

function isAllView(
  props: BlogIndexProps
): props is {
  featuredPosts: BlogPost[]
  topicSections: TopicSection[]
  topicsWithPosts: string[]
  allPosts: BlogPost[]
} {
  return "featuredPosts" in props
}

export function BlogIndex(props: BlogIndexProps) {
  const [searchOpen, setSearchOpen] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setSearchOpen((open) => !open)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  const topicsWithPosts = props.topicsWithPosts
  const tabTopics = BLOG_TOPICS.filter((t) => topicsWithPosts.includes(t.slug))

  return (
    <div className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero */}
        <section className="mb-12 md:mb-16">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 font-unbounded mb-4">
            Insights on the future of banking
          </h1>
          <p className="text-lg sm:text-xl text-gray-500 max-w-2xl">
            The latest updates on Easner and the world of stablecoins and business finance.
          </p>
        </section>

        {/* Toolbar: tabs + search + RSS */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-12 md:mb-16">
          <div className="flex flex-wrap items-center gap-2 overflow-x-auto">
            <Link
              href="/blog"
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                isAllView(props)
                  ? "ring-2 ring-gray-900 text-gray-900"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              All
            </Link>
            {tabTopics.map((t) => (
              <Link
                key={t.slug}
                href={`/blog?topic=${t.slug}`}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  !isAllView(props) && props.topicFilter === t.slug
                    ? "ring-2 ring-gray-900 text-gray-900"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                {t.name}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700 transition-colors text-sm"
            >
              <Search className="h-4 w-4" />
              <span>Search...</span>
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-xs bg-gray-100 rounded">
                ⌘K
              </kbd>
            </button>
            <Link
              href="/blog/feed"
              className="p-2 text-gray-500 hover:text-gray-900 transition-colors"
              aria-label="RSS feed"
            >
              <Rss className="h-5 w-5" />
            </Link>
          </div>
        </div>

        {/* Content */}
        {isAllView(props) ? (
          <>
            <BlogFeaturedBlock posts={props.featuredPosts} />
            {props.topicSections.map((section) => (
              <BlogTopicSection
                key={section.slug}
                topicName={section.name}
                topicSlug={section.slug}
                posts={section.posts}
              />
            ))}
            {props.featuredPosts.length === 0 && props.topicSections.length === 0 && (
              <section className="py-16 text-center">
                <p className="text-gray-500 text-lg">No posts yet. Check back soon.</p>
              </section>
            )}
          </>
        ) : (
          <>
            <h2 className="text-3xl font-bold text-gray-900 font-unbounded mb-8">
              {props.topicHeading}
            </h2>
            <BlogTopicPosts topicSlug={props.topicFilter} initialPosts={props.topicPosts} />
            {props.topicPosts.length === 0 && (
              <p className="text-gray-500 mb-12">No posts in this topic yet.</p>
            )}
            <BlogReadMoreSection
              topics={props.otherTopics}
              currentTopicSlug={props.topicFilter}
            />
          </>
        )}
      </div>

      <BlogSearchDialog
        posts={isAllView(props) ? props.allPosts : [...props.topicPosts, ...props.otherTopics.flatMap((t) => t.posts)]}
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
      />
    </div>
  )
}

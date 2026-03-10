"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Search, Rss, ChevronDown } from "lucide-react"
import { BLOG_TOPICS } from "@easner/shared"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
    <div className="pt-16 sm:pt-20 md:pt-24 lg:pt-28 pb-12 sm:pb-16 md:pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero */}
        <section className="mb-10 sm:mb-12 md:mb-16">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 font-unbounded mb-3 sm:mb-4 lg:mb-5">
            Insights on the
            <br />
            future of banking
          </h1>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-500 md:whitespace-nowrap md:max-w-none max-w-2xl">
            The latest updates on Easner, the world of stablecoins and finance.
          </p>
        </section>

        {/* Toolbar: mobile/tablet = dropdown + icons | desktop = tabs + search button + RSS */}
        <div className="mb-10 sm:mb-12 md:mb-16">
          {/* Mobile/tablet: topic dropdown (left) + search icon + RSS icon (right) */}
          <div className="flex items-center justify-between gap-4 lg:hidden">
            <div className="flex-1 min-w-0">
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-2 w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-gray-900 hover:border-easner-primary hover:text-easner-primary transition-colors duration-200 text-sm font-medium">
                <span className="truncate">
                  {isAllView(props) ? "All" : tabTopics.find((t) => t.slug === props.topicFilter)?.name ?? props.topicHeading}
                </span>
                <ChevronDown className="h-4 w-4 flex-shrink-0 text-gray-400" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="min-w-[12rem]">
                <DropdownMenuItem asChild>
                  <Link href="/blog" className="cursor-pointer">
                    All
                  </Link>
                </DropdownMenuItem>
                {tabTopics.map((t) => (
                  <DropdownMenuItem key={t.slug} asChild>
                    <Link href={`/blog?topic=${t.slug}`} className="cursor-pointer">
                      {t.name}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2.5 text-gray-600 hover:text-easner-primary transition-colors duration-200 rounded-lg hover:bg-easner-primary-50"
                aria-label="Search"
              >
                <Search className="h-5 w-5" />
              </button>
              <Link
                href="/blog/feed"
                className="p-2.5 text-gray-600 hover:text-easner-primary transition-colors duration-200 rounded-lg hover:bg-easner-primary-50"
                aria-label="RSS feed"
              >
                <Rss className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Desktop: tabs + search button + RSS */}
          <div className="hidden lg:grid lg:grid-cols-[1fr_auto] lg:items-center lg:gap-4">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 -ml-4 pl-4 pr-2 min-w-0 scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              <Link
                href="/blog"
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap flex-shrink-0 transition-colors duration-200 ${
                  isAllView(props)
                    ? "bg-easner-primary text-white shadow-sm"
                    : "text-gray-600 hover:text-easner-primary hover:bg-easner-primary-50"
                }`}
              >
                All
              </Link>
              {tabTopics.map((t) => (
                <Link
                  key={t.slug}
                  href={`/blog?topic=${t.slug}`}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap flex-shrink-0 transition-colors duration-200 ${
                    !isAllView(props) && props.topicFilter === t.slug
                      ? "bg-easner-primary text-white shadow-sm"
                      : "text-gray-600 hover:text-easner-primary hover:bg-easner-primary-50"
                  }`}
                >
                  {t.name}
                </Link>
              ))}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => setSearchOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-200 text-gray-600 hover:border-easner-primary hover:text-easner-primary transition-colors duration-200 text-sm"
              >
                <Search className="h-4 w-4" />
                <span>Search...</span>
                <kbd className="px-1.5 py-0.5 text-xs bg-gray-100 rounded">⌘K</kbd>
              </button>
              <Link
                href="/blog/feed"
                className="p-2 text-gray-600 hover:text-easner-primary transition-colors duration-200 rounded-lg hover:bg-easner-primary-50"
                aria-label="RSS feed"
              >
                <Rss className="h-5 w-5" />
              </Link>
            </div>
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
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 font-unbounded mb-6 sm:mb-8">
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

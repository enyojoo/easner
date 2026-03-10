"use client"

import Link from "next/link"
import Image from "next/image"
import { BlogPostRow } from "./blog-post-row"
import type { BlogPost } from "@/lib/blog-service"

interface BlogFeaturedBlockProps {
  posts: BlogPost[]
}

export function BlogFeaturedBlock({ posts }: BlogFeaturedBlockProps) {
  if (posts.length === 0) return null

  const [largePost, ...smallPosts] = posts
  const displaySmall = smallPosts.slice(0, 3)

  const author = largePost.author
  const publishedDate = largePost.published_at
    ? new Date(largePost.published_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null

  return (
    <section className="mb-12 sm:mb-16 md:mb-24">
      <div className="grid lg:grid-cols-[1.5fr_1fr] gap-6 sm:gap-8 lg:gap-10">
        {/* Large featured post - left column, reduced size with spacing */}
        <div className="flex flex-col justify-center">
          <Link
            href={`/blog/${largePost.slug}`}
            className="group block rounded-xl border border-gray-200 overflow-hidden hover:border-easner-primary/50 hover:shadow-lg transition-all duration-200"
          >
            {largePost.cover_image_url && (
              <div className="aspect-video relative bg-gray-100">
                <Image
                  src={largePost.cover_image_url}
                  alt={largePost.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-200"
                  sizes="(max-width: 1024px) 100vw, 55vw"
                  priority
                />
              </div>
            )}
            <div className="p-4 sm:p-5 md:p-6">
              <p className="text-xs sm:text-sm text-gray-500 mb-1 sm:mb-2">
                {author && <span>{author.name}</span>}
                {author && publishedDate && <span> · </span>}
                {publishedDate && (
                  <time dateTime={largePost.published_at || undefined}>
                    {publishedDate}
                  </time>
                )}
              </p>
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 font-unbounded group-hover:text-easner-primary transition-colors line-clamp-2">
                {largePost.title}
              </h2>
            </div>
          </Link>
        </div>

        {/* Small posts - right column, gaps between each */}
        <div className="flex flex-col gap-4 sm:gap-5 lg:gap-6">
          {displaySmall.map((post) => (
            <BlogPostRow key={post.id} post={post} />
          ))}
        </div>
      </div>
    </section>
  )
}

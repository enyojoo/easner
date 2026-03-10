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
    <section className="mb-16 md:mb-24">
      <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
        {/* Large featured post - ~2/3 width */}
        <Link
          href={`/blog/${largePost.slug}`}
          className="lg:col-span-2 group block rounded-xl border border-gray-200 overflow-hidden hover:border-easner-primary/50 hover:shadow-lg transition-all duration-200"
        >
          {largePost.cover_image_url && (
            <div className="aspect-video relative bg-gray-100">
              <Image
                src={largePost.cover_image_url}
                alt={largePost.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-200"
                sizes="(max-width: 1024px) 100vw, 66vw"
                priority
              />
            </div>
          )}
          <div className="p-6">
            <p className="text-sm text-gray-500 mb-2">
              {author && <span>{author.name}</span>}
              {author && publishedDate && <span> · </span>}
              {publishedDate && (
                <time dateTime={largePost.published_at || undefined}>
                  {publishedDate}
                </time>
              )}
            </p>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 font-unbounded group-hover:text-easner-primary transition-colors">
              {largePost.title}
            </h2>
          </div>
        </Link>

        {/* Small posts - ~1/3 width */}
        <div className="flex flex-col gap-4">
          {displaySmall.map((post) => (
            <BlogPostRow key={post.id} post={post} />
          ))}
        </div>
      </div>
    </section>
  )
}

"use client"

import Link from "next/link"
import Image from "next/image"
import type { BlogPost } from "@/lib/blog-service"

interface BlogPostRowProps {
  post: BlogPost
}

export function BlogPostRow({ post }: BlogPostRowProps) {
  const author = post.author
  const publishedDate = post.published_at
    ? new Date(post.published_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex gap-3 sm:gap-4 rounded-xl border border-gray-200 overflow-hidden hover:border-easner-primary/50 hover:shadow-lg transition-all duration-200"
    >
      {post.cover_image_url ? (
        <div className="relative w-24 sm:w-28 md:w-36 lg:w-40 flex-shrink-0 aspect-video bg-gray-100 rounded-l-xl overflow-hidden">
          <Image
            src={post.cover_image_url}
            alt={post.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-200"
            sizes="(max-width: 640px) 96px, (max-width: 768px) 112px, (max-width: 1024px) 144px, 160px"
          />
        </div>
      ) : (
        <div className="w-24 sm:w-28 md:w-36 lg:w-40 flex-shrink-0 aspect-video bg-gray-100 rounded-l-xl" />
      )}
      <div className="flex-1 min-w-0 py-2 sm:py-3 pr-3 sm:pr-4 flex flex-col justify-center">
        <p className="text-xs sm:text-sm text-gray-500 mb-0.5 sm:mb-1">
          {author && <span>{author.name}</span>}
          {author && publishedDate && <span> · </span>}
          {publishedDate && (
            <time dateTime={post.published_at || undefined}>{publishedDate}</time>
          )}
        </p>
        <h3 className="text-sm sm:text-base font-semibold text-gray-900 group-hover:text-easner-primary transition-colors line-clamp-2">
          {post.title}
        </h3>
      </div>
    </Link>
  )
}

"use client"

import Link from "next/link"
import Image from "next/image"
import type { BlogPost } from "@/lib/blog-service"

interface PostCardProps {
  post: BlogPost
}

export function PostCard({ post }: PostCardProps) {
  const author = post.author
  const topic = post.topic
  const publishedDate = post.published_at
    ? new Date(post.published_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group block rounded-xl border border-gray-200 overflow-hidden hover:border-easner-primary/50 hover:shadow-lg transition-all duration-200"
    >
      {post.cover_image_url && (
        <div className="aspect-video relative bg-gray-100">
          <Image
            src={post.cover_image_url}
            alt={post.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-200"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </div>
      )}
      <div className="p-5">
        {topic && (
          <span className="inline-block text-xs font-medium text-easner-primary mb-2">
            {topic.name}
          </span>
        )}
        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-easner-primary transition-colors line-clamp-2 mb-2">
          {post.title}
        </h3>
        {post.excerpt && (
          <p className="text-sm text-gray-500 line-clamp-2 mb-3">{post.excerpt}</p>
        )}
        <div className="flex items-center gap-2 text-sm text-gray-500">
          {author && <span>By {author.name}</span>}
          {publishedDate && (
            <>
              {author && <span>·</span>}
              <time dateTime={post.published_at || undefined}>{publishedDate}</time>
            </>
          )}
        </div>
      </div>
    </Link>
  )
}

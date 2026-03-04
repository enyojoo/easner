"use client"

import Image from "next/image"
import Link from "next/link"
import type { BlogPost } from "@/lib/blog-service"

interface BlogPostContentProps {
  post: BlogPost
}

export function BlogPostContent({ post }: BlogPostContentProps) {
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
    <article className="py-16 md:py-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {topic && (
          <Link
            href={`/blog?topic=${topic.slug}`}
            className="inline-block text-sm font-medium text-easner-primary hover:text-easner-primary-600 mb-4"
          >
            {topic.name}
          </Link>
        )}
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 font-unbounded mb-6">
          {post.title}
        </h1>
        <div className="flex flex-wrap items-center gap-2 text-gray-500 mb-8">
          {author && (
            <span className="flex items-center gap-2">
              {author.avatar_url ? (
                <Image
                  src={author.avatar_url}
                  alt={author.name}
                  width={32}
                  height={32}
                  className="rounded-full"
                />
              ) : null}
              <span>By {author.name}</span>
            </span>
          )}
          {publishedDate && (
            <>
              {author && <span>·</span>}
              <time dateTime={post.published_at || undefined}>{publishedDate}</time>
            </>
          )}
        </div>

        {post.cover_image_url && (
          <div className="relative aspect-video rounded-xl overflow-hidden mb-10">
            <Image
              src={post.cover_image_url}
              alt={post.title}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 672px"
            />
          </div>
        )}

        <div
          className="prose prose-lg max-w-none prose-headings:font-unbounded prose-headings:text-gray-900 prose-p:text-gray-600 prose-a:text-easner-primary prose-a:no-underline hover:prose-a:underline"
          dangerouslySetInnerHTML={{ __html: post.body }}
        />

        {author && author.bio && (
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="flex items-start gap-4">
              {author.avatar_url && (
                <Image
                  src={author.avatar_url}
                  alt={author.name}
                  width={64}
                  height={64}
                  className="rounded-full flex-shrink-0"
                />
              )}
              <div>
                <p className="font-semibold text-gray-900">{author.name}</p>
                <p className="text-gray-500 text-sm mt-1">{author.bio}</p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-12 pt-8 border-t border-gray-200">
          <Link
            href="/blog"
            className="text-easner-primary hover:text-easner-primary-600 font-medium"
          >
            ← Back to Blog
          </Link>
        </div>
      </div>
    </article>
  )
}

"use client"

import Link from "next/link"
import type { BlogTopic } from "@/lib/blog-service"

interface TopicGridProps {
  topics: BlogTopic[]
}

export function TopicGrid({ topics }: TopicGridProps) {
  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 font-unbounded">Explore All Topics</h2>
        <Link
          href="/blog"
          className="text-sm font-medium text-easner-primary hover:text-easner-primary-600 transition-colors"
        >
          Read All Stories
        </Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
        {topics.map((topic) => (
          <Link
            key={topic.id}
            href={`/blog?topic=${topic.slug}`}
            className="block p-4 md:p-5 rounded-xl border border-gray-200 hover:border-easner-primary/50 hover:bg-easner-primary-50/30 transition-all duration-200 group"
          >
            {topic.icon && (
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center mb-3 text-gray-600 group-hover:bg-easner-primary/10 group-hover:text-easner-primary transition-colors">
                <span className="text-lg">{topic.icon}</span>
              </div>
            )}
            <h3 className="font-semibold text-gray-900 group-hover:text-easner-primary transition-colors mb-1">
              {topic.name}
            </h3>
            {topic.description && (
              <p className="text-sm text-gray-500 line-clamp-2">{topic.description}</p>
            )}
          </Link>
        ))}
      </div>
    </div>
  )
}

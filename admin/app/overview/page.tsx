"use client"

import { useMemo } from "react"
import { OverviewView, type OverviewPost } from "@/components/overview/overview-view"
import { useAuth } from "@/lib/auth-context"
import { useCategories, usePosts } from "@/lib/queries"
import { usePostFlags } from "@/lib/queries-pages"

/** Overview (OffBlogOverview): Needs you, the blog's numbers, what works, the pipeline. The view is shared with /dev/overview. */
export default function OverviewPage() {
  const { role, user } = useAuth()
  const flags = usePostFlags()
  const posts = usePosts()
  const categories = useCategories()

  // Review flags are the page's own query; the list query adds cover, author and category for the Top posts table.
  const merged = useMemo<OverviewPost[] | undefined>(() => {
    if (!flags.data) return undefined
    const meta = new Map((posts.data ?? []).map((p) => [p.id, p]))
    return flags.data.map((f) => {
      const m = meta.get(f.id)
      return { ...f, cover_path: m?.cover_path ?? null, category_id: m?.category_id ?? null, authors: m?.authors ?? [] }
    })
  }, [flags.data, posts.data])

  return (
    <OverviewView
      posts={merged}
      categories={(categories.data ?? []).map((c) => ({ id: c.id, name: c.name }))}
      role={role}
      userId={user?.id}
      updatedAt={flags.dataUpdatedAt || undefined}
      error={flags.isError}
      onRetry={() => void flags.refetch()}
    />
  )
}

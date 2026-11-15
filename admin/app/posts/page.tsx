"use client"

import { Suspense, useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { FileText, ImageOff, Plus } from "lucide-react"
import { PostQuickView, displayStatus } from "@/components/posts/post-quick-view"
import { PostsTableSkeleton } from "@/components/admin-skeletons"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import { useAuth } from "@/lib/auth-context"
import { FilterTabs, type FilterTab } from "@/components/ui/filter-tabs"
import { PageHeader } from "@/components/ui/page-header"
import { SearchField } from "@/components/ui/search-field"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { StatusBadge } from "@/components/ui/status-badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { formatListDate, useCategories, usePosts, type PostRow, type PostStatus } from "@/lib/queries"
import { blogFileUrl } from "@/lib/supabase"

type StatusFilter = "all" | "needs-you" | "drafts" | "review" | "scheduled" | "published" | "archived"

const STATUS_TABS: ReadonlyArray<FilterTab<StatusFilter>> = [
  { value: "all", label: "All" },
  { value: "drafts", label: "Drafts" },
  { value: "review", label: "In review" },
  { value: "scheduled", label: "Scheduled" },
  { value: "published", label: "Published" },
  { value: "archived", label: "Archived" },
]

/** Drafts: being written, or sent back with changes requested. In review: waiting for an Editor. */
const STATUS_GROUP: Record<Exclude<StatusFilter, "all" | "needs-you">, PostStatus[]> = {
  drafts: ["draft", "changes_requested"],
  review: ["in_review"],
  scheduled: ["scheduled"],
  published: ["published"],
  archived: ["archived"],
}

/** What waits on this person: reviews for Editors and Owners, their own posts sent back for Writers. Writers see it here, not on Overview. */
function needsYou(post: PostRow, role: string | null, userId: string | undefined): boolean {
  if (role === "owner" || role === "editor") return post.status === "in_review"
  return post.status === "changes_requested" && post.created_by === userId
}

const COLUMNS = ["Post", "Status", "Category", "Author", "Updated", "Published"]
const ALL = "all"

function parseStatus(raw: string | null): StatusFilter {
  return raw === "needs-you" || STATUS_TABS.some((tab) => tab.value === raw) ? (raw as StatusFilter) : "all"
}

function CoverThumb({ post }: { post: PostRow }) {
  const url = blogFileUrl(post.cover_path)
  return (
    <span className="flex h-9 w-16 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted text-muted-foreground">
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element -- Storage URLs; next/image adds nothing for a 64px thumb.
        <img src={url} alt="" className="size-full object-cover" loading="lazy" />
      ) : (
        <ImageOff className="size-4" aria-hidden />
      )}
    </span>
  )
}

function PostsPageInner() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const { role, user } = useAuth()
  const status = parseStatus(searchParams.get("status"))
  const categorySlug = searchParams.get("category") ?? ALL
  const authorId = searchParams.get("author") ?? ALL
  const urlQuery = searchParams.get("q") ?? ""

  const [search, setSearch] = useState(urlQuery)
  const debouncedSearch = useDebouncedValue(search, 250)
  const [quickViewId, setQuickViewId] = useState<string | null>(null)

  const setParams = useCallback(
    (patch: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString())
      for (const [key, value] of Object.entries(patch)) {
        if (value) params.set(key, value)
        else params.delete(key)
      }
      const qs = params.toString()
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
    },
    [pathname, router, searchParams],
  )

  // The search box writes to ?q= after a pause; a link with ?q= fills the box.
  useEffect(() => {
    if (debouncedSearch.trim() !== urlQuery.trim()) setParams({ q: debouncedSearch.trim() || null })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch])
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the URL wins when it changes from outside (Jump to, back).
    setSearch((current) => (current.trim() === urlQuery.trim() ? current : urlQuery))
  }, [urlQuery])

  const postsQuery = usePosts()
  const categoriesQuery = useCategories()
  const posts = useMemo(() => postsQuery.data ?? [], [postsQuery.data])
  const categories = useMemo(() => categoriesQuery.data ?? [], [categoriesQuery.data])
  const categoryById = useMemo(() => new Map(categories.map((category) => [category.id, category])), [categories])

  const authors = useMemo(() => {
    const byId = new Map<string, string>()
    for (const post of posts) for (const author of post.authors) byId.set(author.id, author.name)
    return [...byId].map(([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name))
  }, [posts])

  const filtered = useMemo(() => {
    const q = urlQuery.trim().toLowerCase()
    const categoryId = categorySlug === ALL ? null : (categories.find((c) => c.slug === categorySlug)?.id ?? "none")
    return posts.filter((post) => {
      if (status === "needs-you") {
        if (!needsYou(post, role, user?.id)) return false
      } else if (status !== "all" && !STATUS_GROUP[status].includes(post.status)) return false
      if (categoryId && post.category_id !== categoryId) return false
      if (authorId !== ALL && !post.authors.some((author) => author.id === authorId)) return false
      if (q && !post.title.toLowerCase().includes(q) && !post.slug.includes(q)) return false
      return true
    })
  }, [posts, categories, status, categorySlug, authorId, urlQuery, role, user?.id])

  const waiting = useMemo(() => posts.filter((post) => needsYou(post, role, user?.id)).length, [posts, role, user?.id])
  const statusTabs = useMemo(() => {
    const tabs: Array<FilterTab<StatusFilter>> = STATUS_TABS.map((tab) => ({
      ...tab,
      count:
        tab.value === "all"
          ? posts.length
          : posts.filter((post) => STATUS_GROUP[tab.value as Exclude<StatusFilter, "all" | "needs-you">].includes(post.status)).length,
    }))
    // Shown only while something waits (or while it is the open filter), like Overview's Needs you.
    return waiting > 0 || status === "needs-you" ? [tabs[0], { value: "needs-you" as const, label: "Needs you", count: waiting }, ...tabs.slice(1)] : tabs
  }, [posts, waiting, status])

  const filtersActive = status !== "all" || categorySlug !== ALL || authorId !== ALL || urlQuery.trim() !== ""
  const firstLoad = postsQuery.data === undefined && !postsQuery.isError
  const settled = postsQuery.data !== undefined
  const clearFilters = () => {
    setSearch("")
    router.replace(pathname, { scroll: false })
  }
  const quickViewPost = quickViewId ? (posts.find((post) => post.id === quickViewId) ?? null) : null

  return (
    <div className="space-y-6">
      <PageHeader
        title="Posts"
        description="Every blog post: drafts, posts in review, scheduled and live."
        actions={
          <Button asChild variant="primary" size="sm">
            <Link href="/posts/new">
              <Plus aria-hidden />
              New post
            </Link>
          </Button>
        }
      />

      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <SearchField
            value={search}
            onChange={setSearch}
            placeholder="Search posts"
            title="Matches title and slug. Press / to focus."
          />
          <FilterTabs<StatusFilter>
            variant="pills"
            ariaLabel="Filter posts by status"
            tabs={statusTabs}
            value={status}
            onChange={(next) => setParams({ status: next === "all" ? null : next })}
          />
          <Select value={categorySlug} onValueChange={(next) => setParams({ category: next === ALL ? null : next })}>
            <SelectTrigger aria-label="Category" className="h-9 w-[170px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.slug}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={authorId} onValueChange={(next) => setParams({ author: next === ALL ? null : next })}>
            <SelectTrigger aria-label="Author" className="h-9 w-[170px]">
              <SelectValue placeholder="Author" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All authors</SelectItem>
              {authors.map((author) => (
                <SelectItem key={author.id} value={author.id}>
                  {author.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <p className="text-xs text-muted-foreground" aria-live="polite">
          {settled ? `${filtered.length.toLocaleString("en-US")} ${filtered.length === 1 ? "post" : "posts"}` : " "}
        </p>
      </div>

      <Card padding="none" className="gap-0 overflow-hidden">
        {postsQuery.isError && !settled ? (
          <EmptyState
            icon={FileText}
            title="Posts didn’t load"
            message="Check your connection and try again."
            actions={
              <Button type="button" variant="outline" size="sm" onClick={() => void postsQuery.refetch()}>
                Try again
              </Button>
            }
          />
        ) : firstLoad ? (
          <PostsTableSkeleton columns={COLUMNS} />
        ) : filtered.length === 0 ? (
          filtersActive ? (
            <EmptyState
              icon={FileText}
              title="No posts match these filters"
              message="Try a different title or slug, or widen the filters."
              actions={
                <Button type="button" variant="outline" size="sm" onClick={clearFilters}>
                  Clear filters
                </Button>
              }
            />
          ) : (
            <EmptyState
              icon={FileText}
              title="No posts yet"
              message="Drafts, posts in review and published posts will all show here."
              actions={
                <Button asChild variant="primary" size="sm">
                  <Link href="/posts/new">Write your first post</Link>
                </Button>
              }
            />
          )
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="min-w-[240px]">Post</TableHead>
                <TableHead className="w-[170px]">Status</TableHead>
                <TableHead className="hidden w-[160px] xl:table-cell">Category</TableHead>
                <TableHead className="hidden w-[180px] min-[1180px]:table-cell">Author</TableHead>
                <TableHead className="w-[110px]">Updated</TableHead>
                <TableHead className="hidden w-[110px] min-[1360px]:table-cell">Published</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((post) => (
                <TableRow
                  key={post.id}
                  tabIndex={0}
                  aria-label={`${post.title || "Untitled"}, open quick view`}
                  className="h-14 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                  onClick={() => setQuickViewId(post.id)}
                  onKeyDown={(event) => {
                    if (event.target !== event.currentTarget || event.key !== "Enter") return
                    event.preventDefault()
                    setQuickViewId(post.id)
                  }}
                >
                  <TableCell className="max-w-0">
                    <div className="flex min-w-0 items-center gap-3">
                      <CoverThumb post={post} />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">{post.title || "Untitled"}</p>
                        <p className="truncate font-mono text-xs text-muted-foreground">/blog/{post.slug}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={displayStatus(post)} />
                  </TableCell>
                  <TableCell className="hidden text-sm text-foreground xl:table-cell">
                    {post.category_id ? (categoryById.get(post.category_id)?.name ?? "–") : "–"}
                  </TableCell>
                  <TableCell className="hidden max-w-0 truncate text-sm text-foreground min-[1180px]:table-cell">
                    {post.authors.map((author) => author.name).join(", ") || "–"}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground tabular-nums">{formatListDate(post.updated_at)}</TableCell>
                  <TableCell className="hidden text-sm text-muted-foreground tabular-nums min-[1360px]:table-cell">{formatListDate(post.published_at)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <PostQuickView
        post={quickViewPost}
        categoryName={quickViewPost?.category_id ? categoryById.get(quickViewPost.category_id)?.name : undefined}
        onClose={() => setQuickViewId(null)}
      />
    </div>
  )
}

export default function PostsPage() {
  return (
    <Suspense fallback={null}>
      <PostsPageInner />
    </Suspense>
  )
}

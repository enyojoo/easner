"use client"

import { Suspense, useMemo, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { AlertCircle, CalendarClock, ClipboardCheck, LayoutDashboard, ShieldCheck, type LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import { FilterTabs, type FilterTab } from "@/components/ui/filter-tabs"
import { PageHeader } from "@/components/ui/page-header"
import { Skeleton } from "@/components/ui/skeleton"
import { TopPostsThisWeek } from "@/components/analytics/top-posts-week"
import { useAuth } from "@/lib/auth-context"
import { usePostFlags, type PostFlagRow } from "@/lib/queries-pages"

type Period = "7d" | "30d" | "90d" | "12m"
const PERIODS: ReadonlyArray<FilterTab<Period>> = [
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
  { value: "90d", label: "90 days" },
  { value: "12m", label: "12 months" },
]
const PERIOD_DAYS: Record<Period, number> = { "7d": 7, "30d": 30, "90d": 90, "12m": 365 }
const DAY = 24 * 60 * 60 * 1000

function formatWhen(value: string): string {
  return new Date(value).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZoneName: "short" })
}

function plural(n: number, one: string, many: string): string {
  return `${n} ${n === 1 ? one : many}`
}

type NeedsRow = {
  key: string
  icon: LucideIcon
  tone: "work" | "info"
  line: string
  detail: string
  action: string
  href: string
}

function NeedsYou({ rows }: { rows: NeedsRow[] }) {
  if (rows.length === 0) return null
  return (
    <section aria-labelledby="needs-you" className="space-y-3">
      <h2 id="needs-you" className="text-base font-semibold text-foreground">
        Needs you
      </h2>
      <Card padding="none" className="gap-0 divide-y divide-border/60 overflow-hidden">
        {rows.map((row) => {
          const Icon = row.icon
          return (
            <div key={row.key} className="flex items-center gap-4 px-5 py-4">
              <span
                className={
                  row.tone === "work"
                    ? "flex size-8 shrink-0 items-center justify-center rounded-full bg-warning-surface text-warning-text"
                    : "flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground"
                }
              >
                <Icon className="size-4" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{row.line}</p>
                <p className="truncate text-xs text-muted-foreground">{row.detail}</p>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link href={row.href}>{row.action}</Link>
              </Button>
            </div>
          )
        })}
      </Card>
    </section>
  )
}

function buildRows(posts: PostFlagRow[], role: string | null, userId: string | undefined): NeedsRow[] {
  const rows: NeedsRow[] = []
  const now = Date.now()
  const editor = role === "owner" || role === "editor"
  if (editor) {
    const flagged = posts.filter((p) => p.status === "in_review" && p.claims_flagged && p.created_by !== userId)
    const plain = posts.filter((p) => p.status === "in_review" && !p.claims_flagged)
    if (plain.length) {
      rows.push({
        key: "review",
        icon: ClipboardCheck,
        tone: "work",
        line: `${plural(plain.length, "post is", "posts are")} waiting for your review`,
        detail: plain.length === 1 ? plain[0].title || "Untitled" : `Newest: ${plain[0].title || "Untitled"}`,
        action: plain.length === 1 ? "Open post" : "Review posts",
        href: plain.length === 1 ? `/posts/${plain[0].id}` : "/posts?status=review",
      })
    }
    if (flagged.length) {
      rows.push({
        key: "claims",
        icon: ShieldCheck,
        tone: "work",
        line: `${plural(flagged.length, "post needs", "posts need")} a second Editor’s approval`,
        detail: "They make claims about fees, rates, insurance or regulation.",
        action: flagged.length === 1 ? "Open post" : "Review posts",
        href: flagged.length === 1 ? `/posts/${flagged[0].id}` : "/posts?status=review",
      })
    }
    const soon = posts
      .filter((p) => p.status === "scheduled" && p.scheduled_for && new Date(p.scheduled_for).getTime() > now && new Date(p.scheduled_for).getTime() - now <= 2 * DAY)
      .sort((a, b) => new Date(a.scheduled_for!).getTime() - new Date(b.scheduled_for!).getTime())
    if (soon.length) {
      rows.push({
        key: "soon",
        icon: CalendarClock,
        tone: "info",
        line: `${plural(soon.length, "post goes", "posts go")} live in the next 48 hours`,
        detail: `${soon[0].title || "Untitled"}, ${formatWhen(soon[0].scheduled_for!)}`,
        action: "View scheduled",
        href: "/posts?status=scheduled",
      })
    }
  } else {
    const mine = posts.filter((p) => p.status === "changes_requested" && p.created_by === userId)
    if (mine.length) {
      rows.push({
        key: "changes",
        icon: AlertCircle,
        tone: "work",
        line: `${plural(mine.length, "of your posts has", "of your posts have")} changes requested`,
        detail: mine.length === 1 ? mine[0].title || "Untitled" : `Newest: ${mine[0].title || "Untitled"}`,
        action: mine.length === 1 ? "Open post" : "View drafts",
        href: mine.length === 1 ? `/posts/${mine[0].id}` : "/posts?status=drafts",
      })
    }
  }
  return rows
}

function OverviewInner() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { role, user } = useAuth()
  const raw = searchParams.get("period")
  const period: Period = PERIODS.some((p) => p.value === raw) ? (raw as Period) : "30d"

  const [now] = useState(() => Date.now())
  const query = usePostFlags()
  const posts = useMemo(() => query.data ?? [], [query.data])

  const rows = useMemo(() => buildRows(posts, role, user?.id), [posts, role, user?.id])
  const pipeline = useMemo(() => {
    const since = now - PERIOD_DAYS[period] * DAY
    return {
      drafts: posts.filter((p) => p.status === "draft" || p.status === "changes_requested").length,
      review: posts.filter((p) => p.status === "in_review").length,
      scheduled: posts.filter((p) => p.status === "scheduled").length,
      published: posts.filter((p) => p.status === "published" && p.published_at && new Date(p.published_at).getTime() >= since).length,
    }
  }, [posts, period, now])

  const firstLoad = query.data === undefined && !query.isError
  const minutes = query.dataUpdatedAt ? Math.max(0, Math.round((now - query.dataUpdatedAt) / 60000)) : null
  const updated = minutes === null ? "" : minutes === 0 ? "Updated just now." : `Updated ${minutes} min ago.`

  const cells: Array<{ label: string; value: number; href: string }> = [
    { label: "Drafts", value: pipeline.drafts, href: "/posts?status=drafts" },
    { label: "In review", value: pipeline.review, href: "/posts?status=review" },
    { label: "Scheduled", value: pipeline.scheduled, href: "/posts?status=scheduled" },
    { label: "Published", value: pipeline.published, href: "/posts?status=published" },
  ]

  return (
    <div className="space-y-8">
      <PageHeader
        title="Overview"
        description={`What needs you, and what’s working. ${updated}`.trim()}
        actions={
          <FilterTabs<Period>
            variant="pills"
            ariaLabel="Period"
            tabs={PERIODS}
            value={period}
            onChange={(next) => router.replace(next === "30d" ? pathname : `${pathname}?period=${next}`, { scroll: false })}
          />
        }
      />

      {query.isError && !query.data ? (
        <Card padding="none">
          <EmptyState
            icon={LayoutDashboard}
            title="Overview didn’t load"
            message="Check your connection and try again."
            actions={
              <Button type="button" variant="outline" size="sm" onClick={() => void query.refetch()}>
                Try again
              </Button>
            }
          />
        </Card>
      ) : firstLoad ? (
        <div className="space-y-4" aria-busy="true" aria-label="Loading overview">
          <Skeleton className="h-28 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
      ) : posts.length === 0 ? (
        <Card padding="none">
          <EmptyState
            icon={LayoutDashboard}
            title="Write your first post"
            message="Posts waiting for review and the state of your pipeline will show here."
            actions={
              <Button asChild variant="primary" size="sm">
                <Link href="/posts/new">New post</Link>
              </Button>
            }
          />
        </Card>
      ) : (
        <>
          <NeedsYou rows={rows} />
          <section aria-labelledby="pipeline" className="space-y-3">
            <h2 id="pipeline" className="text-base font-semibold text-foreground">
              Pipeline
            </h2>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {cells.map((cell) => (
                <Link key={cell.label} href={cell.href} className="rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <Card className="gap-1 transition-shadow hover:shadow-card">
                    <p className="text-sm text-muted-foreground">{cell.label}</p>
                    <p className="text-2xl font-semibold tabular-nums text-foreground">{cell.value}</p>
                    {cell.label === "Published" ? (
                      <p className="text-xs text-muted-foreground">{PERIODS.find((p) => p.value === period)?.label}</p>
                    ) : null}
                  </Card>
                </Link>
              ))}
            </div>
          </section>
          <TopPostsThisWeek />
        </>
      )}
    </div>
  )
}

export default function OverviewPage() {
  return (
    <Suspense fallback={null}>
      <OverviewInner />
    </Suspense>
  )
}

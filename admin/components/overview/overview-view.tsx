"use client"

import { Suspense, useMemo, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Calendar, CircleCheck, LayoutDashboard, Pencil, Send, ShieldCheck, Sparkles, type LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardBody } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import { FilterTabs, type FilterTab } from "@/components/ui/filter-tabs"
import { PageHeader } from "@/components/ui/page-header"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ConnectState } from "@/components/analytics/analytics-view"
import { ViewsChart } from "@/components/overview/views-chart"
import { fillDays, formatCount, formatDay, formatPercent, previousRange, rangeForPeriod, readDepthPercent, sumDaily, type Period } from "@/lib/analytics/aggregate"
import { useAnalyticsStatus, useBreakdown, useDaily, usePages, useSearch, useTopPosts } from "@/lib/analytics/hooks"
import { changeText, groupChannels, pointsText, publishDots, rollupCategories, type ChangeText } from "@/lib/analytics/overview"
import { addDays, isoDay } from "@/lib/analytics/paths"
import type { DateRange, TopPostRow } from "@/lib/analytics/source"
import { BLOG_PATH, SITE_PATH } from "@/lib/analytics/types"
import { blogFileUrl } from "@/lib/supabase"
import { cn } from "@/lib/utils"
import type { PostFlagRow } from "@/lib/queries-pages"

const PERIODS: ReadonlyArray<FilterTab<Period>> = [
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
  { value: "90d", label: "90 days" },
  { value: "12m", label: "12 months" },
]
const DAY = 24 * 60 * 60 * 1000
const PERIOD_DAYS: Record<Period, number> = { "7d": 7, "30d": 30, "90d": 90, "12m": 365 }
const COMPARE_LABEL: Record<Period, string> = { "7d": "previous 7 days", "30d": "previous 30 days", "90d": "previous 90 days", "12m": "previous 12 months" }

/** A post as Overview needs it: review flags plus what the Top posts table shows. */
export type OverviewPost = PostFlagRow & {
  cover_path?: string | null
  category_id?: string | null
  authors?: Array<{ id: string; name: string }>
}

export interface OverviewViewProps {
  posts: OverviewPost[] | undefined
  categories: Array<{ id: string; name: string }>
  role: string | null
  userId: string | undefined
  /** Epoch ms of the last successful posts refresh, for "Updated 4 min ago". */
  updatedAt?: number
  error?: boolean
  onRetry?: () => void
}

const overline = "text-[11px] font-medium uppercase leading-4 tracking-[0.08em] text-muted-foreground"
const subtle = "text-[13px] leading-[18px] text-muted-foreground"

function plural(n: number, one: string, many: string): string {
  return `${n} ${n === 1 ? one : many}`
}

function formatWhen(value: string): string {
  return new Date(value).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZoneName: "short" })
}

// ---------------------------------------------------------------------------------------------------------------
// Needs you
// ---------------------------------------------------------------------------------------------------------------

type NeedsRow = { key: string; icon: LucideIcon; tone: "work" | "info"; strong: string; rest: string; detail: string; action: string; href: string }

function buildRows(posts: OverviewPost[], role: string | null, userId: string | undefined, now: number): NeedsRow[] {
  const rows: NeedsRow[] = []
  const editor = role === "owner" || role === "editor"
  const title = (p: OverviewPost) => p.title || "Untitled"
  if (editor) {
    const waiting = posts.filter((p) => p.status === "in_review")
    const plain = waiting.filter((p) => !p.claims_flagged)
    const flagged = waiting.filter((p) => p.claims_flagged && p.created_by !== userId)
    if (plain.length) {
      rows.push({
        key: "review", icon: Send, tone: "work",
        strong: plural(plain.length, "post", "posts"), rest: `${plain.length === 1 ? " is" : " are"} waiting for your review`,
        detail: plain.slice(0, 2).map(title).join(" · "),
        action: plain.length === 1 ? "Open" : "Review", href: plain.length === 1 ? `/posts/${plain[0].id}` : "/posts?status=review",
      })
    }
    if (flagged.length) {
      rows.push({
        key: "claims", icon: ShieldCheck, tone: "work",
        strong: flagged.length === 1 ? title(flagged[0]) : plural(flagged.length, "post", "posts"), rest: flagged.length === 1 ? " needs a second approval" : " need a second approval",
        detail: "They make claims about fees, rates, insurance or regulation, so another Editor has to approve.",
        action: "Open", href: flagged.length === 1 ? `/posts/${flagged[0].id}` : "/posts?status=review",
      })
    }
    const soon = posts
      .filter((p) => p.status === "scheduled" && p.scheduled_for && new Date(p.scheduled_for).getTime() > now && new Date(p.scheduled_for).getTime() - now <= 2 * DAY)
      .sort((a, b) => new Date(a.scheduled_for!).getTime() - new Date(b.scheduled_for!).getTime())
    if (soon.length) {
      rows.push({
        key: "soon", icon: Calendar, tone: "info",
        strong: soon.length === 1 ? title(soon[0]) : plural(soon.length, "post", "posts"), rest: soon.length === 1 ? " goes live in the next 48 hours" : " go live in the next 48 hours",
        detail: formatWhen(soon[0].scheduled_for!),
        action: "Open", href: soon.length === 1 ? `/posts/${soon[0].id}` : "/posts?status=scheduled",
      })
    }
  }
  // Writers get no card here: their changes-requested posts sit under "Needs you" on the Posts list and in the nav count.
  return rows
}

function NeedsYou({ rows }: { rows: NeedsRow[] }) {
  if (rows.length === 0) return null
  return (
    <Card padding="lg" aria-labelledby="needs-you" role="region" className="gap-4">
      <CardBody>
        <h2 id="needs-you" className="text-base font-semibold leading-6 text-foreground">Needs you</h2>
        <p className={subtle}>{plural(rows.length, "item", "items")}</p>
      </CardBody>
      <CardBody>
        {rows.map((row) => {
          const Icon = row.icon
          return (
            <div key={row.key} className="flex items-center gap-3.5 border-t border-border/60 py-3 first:border-t-0 first:pt-0 last:pb-0">
              <span className={cn("grid size-8 shrink-0 place-items-center rounded-full", row.tone === "work" ? "bg-warning-surface text-warning-text" : "bg-muted text-muted-foreground")}>
                <Icon className="size-4" aria-hidden />
              </span>
              <div className="min-w-0 flex-1 text-sm leading-5 text-foreground">
                <p><span className="font-semibold">{row.strong}</span>{row.rest}</p>
                <p className={cn(subtle, "truncate")}>{row.detail}</p>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link href={row.href}>{row.action}</Link>
              </Button>
            </div>
          )
        })}
      </CardBody>
    </Card>
  )
}

// ---------------------------------------------------------------------------------------------------------------
// Blocks that read analytics
// ---------------------------------------------------------------------------------------------------------------

function Heading({ id, title, sub, action }: { id: string; title: string; sub?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <h2 id={id} className="text-base font-semibold leading-6 text-foreground">{title}</h2>
        {sub ? <p className={subtle}>{sub}</p> : null}
      </div>
      {action}
    </div>
  )
}

function Delta({ change, suffix }: { change: ChangeText | null; suffix?: string }) {
  if (!change) return <p className="text-xs font-medium leading-4 text-muted-foreground">No previous data</p>
  return (
    <p className={cn("text-xs font-medium leading-4 tabular-nums", change.tone === "up" ? "text-success-text" : "text-muted-foreground")}>
      {change.text}
      {suffix && change.tone !== "flat" ? ` ${suffix}` : ""}
    </p>
  )
}

function sumTop(rows: TopPostRow[] | undefined) {
  const r = rows ?? []
  const sum = (pick: (x: TopPostRow) => number) => r.reduce((s, x) => s + pick(x), 0)
  const readers = sum((x) => x.readers)
  return {
    views: sum((x) => x.views), readers, signups: sum((x) => x.signups),
    depth: readDepthPercent(sum((x) => x.depth_25), sum((x) => x.depth_50), sum((x) => x.depth_75), sum((x) => x.depth_100), readers),
  }
}

interface Scope {
  period: Period
  range: DateRange
  prev: DateRange
  label: string
}

function Kpis({ scope }: { scope: Scope }) {
  const now = useTopPosts(scope.range, 200)
  const before = useTopPosts(scope.prev, 200)
  const loading = now.isLoading || before.isLoading
  const t = useMemo(() => sumTop(now.data), [now.data])
  const p = useMemo(() => sumTop(before.data), [before.data])
  const tiles: Array<{ label: string; value: string; change: ChangeText | null }> = [
    { label: "Views", value: formatCount(t.views), change: changeText(t.views, p.views) },
    { label: "Readers", value: formatCount(t.readers), change: changeText(t.readers, p.readers) },
    { label: "Avg. read depth", value: t.depth === null ? "n/a" : `${Math.round(t.depth)}%`, change: pointsText(t.depth, p.depth) },
    { label: "Sign-ups from the blog", value: formatCount(t.signups), change: changeText(t.signups, p.signups) },
  ]
  return (
    <section aria-label="Key numbers" className="grid grid-cols-2 gap-4 xl:grid-cols-4">
      {tiles.map((tile, i) => (
        <Card key={tile.label} padding="md" className="min-w-0 gap-1.5 px-6">
          <p className={cn(overline, "truncate")}>{tile.label}</p>
          {loading ? (
            <>
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-4 w-28" />
            </>
          ) : (
            <>
              <p className="truncate text-2xl font-semibold leading-8 tracking-[-0.01em] tabular-nums text-foreground">{tile.value}</p>
              <Delta change={tile.change} suffix={i === 0 ? `vs ${COMPARE_LABEL[scope.period]}` : undefined} />
            </>
          )}
        </Card>
      ))}
    </section>
  )
}

function BlogViews({ scope, posts }: { scope: Scope; posts: OverviewPost[] }) {
  const current = useDaily(BLOG_PATH, scope.range)
  const before = useDaily(BLOG_PATH, scope.prev)
  const points = useMemo(() => fillDays(current.data ?? [], scope.range), [current.data, scope.range])
  const previous = useMemo(() => fillDays(before.data ?? [], scope.prev), [before.data, scope.prev])
  const hasPrevious = previous.length === points.length && previous.some((p) => p.views > 0)
  const dots = useMemo(() => publishDots(posts, scope.range), [posts, scope.range])
  const periodLabel = PERIODS.find((x) => x.value === scope.period)?.label ?? ""
  return (
    <Card padding="lg" className="gap-4 px-6" aria-labelledby="blog-views">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 id="blog-views" className="text-base font-semibold leading-6 text-foreground">Blog views</h2>
          <p className={subtle}>{periodLabel}, compared with the {COMPARE_LABEL[scope.period]}</p>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-xs leading-4 text-muted-foreground">
          <span className="inline-flex items-center gap-1.5"><span className="inline-block h-0 w-4 border-t-2 border-chart-1" aria-hidden />This period</span>
          {hasPrevious ? <span className="inline-flex items-center gap-1.5"><span className="inline-block h-0 w-4 border-t-2 border-dashed border-chart-5" aria-hidden />Previous period</span> : null}
          <span className="inline-flex items-center gap-1.5"><span className="inline-block size-2.5 rounded-full border-2 border-chart-1 bg-card" aria-hidden />Post published</span>
        </div>
      </div>
      {current.isLoading ? (
        <Skeleton className="h-60 w-full" />
      ) : (
        <ViewsChart
          days={points.map((p) => p.date)}
          views={points.map((p) => p.views)}
          previous={hasPrevious ? previous.map((p) => p.views) : null}
          dots={dots}
          ariaLabel={`Blog views per day, ${formatDay(scope.range.from)} to ${formatDay(scope.range.to)}`}
        />
      )}
    </Card>
  )
}

function Cover({ post, index }: { post: OverviewPost | undefined; index: number }) {
  const url = blogFileUrl(post?.cover_path)
  const fallbacks = [
    "linear-gradient(135deg, var(--brand-navy), var(--primary))",
    "linear-gradient(160deg, var(--surface-tint), color-mix(in srgb, var(--primary) 45%, var(--surface-tint)))",
    "linear-gradient(135deg, color-mix(in srgb, var(--chart-4) 70%, var(--background)), var(--chart-4))",
    "linear-gradient(135deg, var(--background), color-mix(in srgb, var(--chart-3) 55%, var(--background)))",
    "linear-gradient(135deg, var(--chart-2), color-mix(in srgb, var(--chart-2) 60%, var(--primary)))",
  ]
  return (
    <span
      aria-hidden
      className="relative block h-8 w-14 shrink-0 overflow-hidden rounded-lg bg-muted shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--border)_70%,transparent)]"
      style={url ? undefined : { background: fallbacks[index % fallbacks.length] }}
    >
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="" className="size-full object-cover" />
      ) : null}
    </span>
  )
}

function shortDate(value: string | null): string {
  if (!value) return ""
  return new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

function TopPosts({ scope, posts }: { scope: Scope; posts: OverviewPost[] }) {
  const query = useTopPosts(scope.range, 10)
  const rows = query.data ?? []
  const byId = useMemo(() => new Map(posts.map((p) => [p.id, p])), [posts])
  const periodLabel = PERIODS.find((x) => x.value === scope.period)?.label ?? ""
  return (
    <Card padding="none" className="gap-4 overflow-hidden" aria-labelledby="top-posts">
      <div className="px-6 pt-5">
        <Heading id="top-posts" title="Top posts" sub={periodLabel} action={<Link href={`/analytics?tab=blog&period=${scope.period}`} className="whitespace-nowrap text-sm font-medium leading-5 text-primary-text hover:underline">View all</Link>} />
      </div>
      {query.isLoading ? (
        <div className="px-6 pb-5"><Skeleton className="h-40 w-full" /></div>
      ) : rows.length === 0 ? (
        <p className="px-6 pb-6 text-sm text-muted-foreground">No post views in this period.</p>
      ) : (
        <Table aria-label="Top posts">
          <TableHeader>
            <TableRow>
              <TableHead className="pl-6">Post</TableHead>
              <TableHead className="w-px whitespace-nowrap">Category</TableHead>
              <TableHead className="w-px whitespace-nowrap text-right">Views</TableHead>
              <TableHead className="w-px whitespace-nowrap text-right">Read depth</TableHead>
              <TableHead className="w-px whitespace-nowrap text-right">CTA clicks</TableHead>
              <TableHead className="w-px whitespace-nowrap pr-6 text-right">Sign-ups</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((post, i) => {
              const meta = byId.get(post.post_id)
              const depth = readDepthPercent(post.depth_25, post.depth_50, post.depth_75, post.depth_100, post.readers)
              const author = meta?.authors?.[0]?.name
              return (
                <TableRow key={post.post_id} className="relative">
                  <TableCell className="pl-6">
                    <div className="flex min-w-0 items-center gap-3">
                      <Cover post={meta} index={i} />
                      <div className="min-w-0">
                        <Link href={`/posts/${post.post_id}`} className="block max-w-[420px] truncate text-sm font-medium leading-5 text-foreground after:absolute after:inset-0 hover:underline focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-inset focus-visible:after:ring-ring">
                          {post.title || "Untitled"}
                        </Link>
                        <p className="truncate text-xs leading-4 text-muted-foreground">{[author, shortDate(post.published_at)].filter(Boolean).join(" · ")}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">{post.category_name ?? "No category"}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatCount(post.views)}</TableCell>
                  <TableCell className="text-right tabular-nums">{depth === null ? "n/a" : `${Math.round(depth)}%`}</TableCell>
                  <TableCell className="text-right tabular-nums">{post.views ? formatPercent(post.cta_clicks / post.views, 1) : "n/a"}</TableCell>
                  <TableCell className="pr-6 text-right font-semibold tabular-nums">{formatCount(post.signups)}</TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      )}
    </Card>
  )
}

const BAR_TONES = ["bg-chart-1", "bg-chart-2", "bg-chart-3", "bg-chart-4", "bg-chart-5"]

function Bar({ pct, tone = 0 }: { pct: number; tone?: number }) {
  return (
    <span className="block h-2 min-w-[60px] overflow-hidden rounded bg-muted/80" aria-hidden>
      <span className={cn("block h-full rounded", BAR_TONES[tone % BAR_TONES.length])} style={{ width: `${Math.max(2, Math.min(100, pct))}%` }} />
    </span>
  )
}

const CHANNEL_TONE: Record<string, number> = { Google: 0, Direct: 1, Social: 2, "AI answers": 3, Email: 4, Other: 4 }

function Sources({ scope }: { scope: Scope }) {
  const query = useBreakdown(scope.range, BLOG_PATH, "source")
  const rows = useMemo(() => groupChannels(query.data ?? []), [query.data])
  const max = Math.max(1, ...rows.map((r) => r.visitors))
  const periodLabel = PERIODS.find((x) => x.value === scope.period)?.label ?? ""
  return (
    <Card padding="lg" className="gap-4 px-6" aria-labelledby="sources">
      <Heading id="sources" title="Where readers come from" sub={`Blog visits, ${periodLabel}`} />
      {query.isLoading ? (
        <Skeleton className="h-40 w-full" />
      ) : rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">No visits in this period.</p>
      ) : (
        <>
          <ul>
            {rows.map((row) => (
              <li key={row.channel} className="grid grid-cols-[minmax(0,1fr)_120px_64px] items-center gap-3 border-t border-border/60 py-[9px] text-sm leading-5 first:border-t-0">
                <span className="flex min-w-0 items-center gap-2 truncate">{row.channel === "AI answers" ? <Sparkles className="size-3.5 shrink-0" aria-hidden /> : null}{row.channel}</span>
                <Bar pct={(row.visitors / max) * 100} tone={CHANNEL_TONE[row.channel]} />
                <span className="text-right font-medium tabular-nums">{formatCount(row.visitors)}</span>
              </li>
            ))}
          </ul>
          <p className={subtle}>AI answers groups visits from ChatGPT, Perplexity, Gemini, Copilot and Claude.</p>
        </>
      )}
    </Card>
  )
}

function Searches({ today }: { today: string }) {
  const to = addDays(today, -3)
  const range = useMemo(() => ({ from: addDays(to, -27), to }), [to])
  const query = useSearch(range, "blog")
  const rows = (query.data ?? []).slice(0, 5)
  return (
    <Card padding="none" className="gap-4 overflow-hidden" aria-labelledby="searches">
      <div className="px-6 pt-5">
        <Heading id="searches" title="Google searches" sub="Blog pages, 28 days · Search Console" />
      </div>
      {query.isLoading ? (
        <div className="px-6 pb-5"><Skeleton className="h-40 w-full" /></div>
      ) : rows.length === 0 ? (
        <p className="px-6 pb-6 text-sm text-muted-foreground">Search Console has no searches for the blog yet. It adds them once it is connected.</p>
      ) : (
        <Table aria-label="Top Google queries">
          <TableHeader>
            <TableRow>
              <TableHead className="px-3 pl-6">Query</TableHead>
              <TableHead className="w-px whitespace-nowrap px-3 text-right">Impr.</TableHead>
              <TableHead className="w-px whitespace-nowrap px-3 text-right">Clicks</TableHead>
              <TableHead className="w-px whitespace-nowrap px-3 text-right">CTR</TableHead>
              <TableHead className="w-px whitespace-nowrap px-3 pr-6 text-right">Pos.</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.query}>
                <TableCell className="px-3 pl-6">{r.query}</TableCell>
                <TableCell className="px-3 text-right tabular-nums">{formatCount(r.impressions)}</TableCell>
                <TableCell className="px-3 text-right tabular-nums">{formatCount(r.clicks)}</TableCell>
                <TableCell className="px-3 text-right tabular-nums">{r.impressions ? formatPercent(r.clicks / r.impressions, 1) : "n/a"}</TableCell>
                <TableCell className="px-3 pr-6 text-right tabular-nums">{r.avg_position === null ? "n/a" : r.avg_position.toFixed(1)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Card>
  )
}

function Categories({ scope, posts, categories }: { scope: Scope; posts: OverviewPost[]; categories: Array<{ id: string; name: string }> }) {
  const query = useTopPosts(scope.range, 200)
  const names = useMemo(() => new Map(categories.map((c) => [c.id, c.name])), [categories])
  const rows = useMemo(
    () =>
      rollupCategories(
        query.data ?? [],
        posts.filter((p) => p.status === "published").map((p) => ({ category: (p.category_id && names.get(p.category_id)) || null })),
      ).slice(0, 8),
    [query.data, posts, names],
  )
  const max = Math.max(1, ...rows.map((r) => r.views))
  const periodLabel = PERIODS.find((x) => x.value === scope.period)?.label ?? ""
  return (
    <Card padding="lg" className="gap-4 px-6" aria-labelledby="categories">
      <Heading id="categories" title="Categories" sub={`Views and published posts, ${periodLabel}`} />
      {query.isLoading ? (
        <Skeleton className="h-40 w-full" />
      ) : rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">No category has views in this period.</p>
      ) : (
        <ul>
          <li className={cn(overline, "grid grid-cols-[minmax(0,1fr)_160px_56px_64px] items-center gap-3 pb-[9px]")} aria-hidden>
            <span>Category</span>
            <span />
            <span className="text-right">Posts</span>
            <span className="text-right">Views</span>
          </li>
          {rows.map((row) => (
            <li key={row.name} className="grid grid-cols-[minmax(0,1fr)_160px_56px_64px] items-center gap-3 border-t border-border/60 py-[9px] text-sm leading-5">
              <span className="truncate">{row.name}</span>
              <Bar pct={(row.views / max) * 100} />
              <span className="text-right tabular-nums text-muted-foreground">{row.posts}</span>
              <span className="text-right font-medium tabular-nums">{formatCount(row.views)}</span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}

function Pipeline({ posts, scope, now }: { posts: OverviewPost[]; scope: Scope; now: number }) {
  const since = now - PERIOD_DAYS[scope.period] * DAY
  const periodLabel = PERIODS.find((x) => x.value === scope.period)?.label ?? ""
  const cells: Array<{ icon: LucideIcon; label: string; value: number; href: string }> = [
    { icon: Pencil, label: "Drafts", value: posts.filter((p) => p.status === "draft" || p.status === "changes_requested").length, href: "/posts?status=drafts" },
    { icon: Send, label: "In review", value: posts.filter((p) => p.status === "in_review").length, href: "/posts?status=review" },
    { icon: Calendar, label: "Scheduled", value: posts.filter((p) => p.status === "scheduled").length, href: "/posts?status=scheduled" },
    { icon: CircleCheck, label: `Published, ${periodLabel}`, value: posts.filter((p) => p.status === "published" && p.published_at && new Date(p.published_at).getTime() >= since).length, href: "/posts?status=published" },
  ]
  return (
    <Card padding="lg" className="gap-4 px-6" aria-labelledby="pipeline">
      <Heading id="pipeline" title="Pipeline" />
      <div className="grid grid-cols-2 gap-y-6">
        {cells.map((cell, i) => {
          const Icon = cell.icon
          return (
            <Link
              key={cell.label}
              href={cell.href}
              className={cn(
                "grid gap-1 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring",
                i % 2 === 1 ? "border-l border-border/60 pl-6" : "pr-6",
              )}
            >
              <span className="flex items-center gap-2 text-[13px] font-medium leading-[18px] text-muted-foreground"><Icon className="size-3.5" strokeWidth={1.75} aria-hidden />{cell.label}</span>
              <span className="text-[28px] font-semibold leading-9 tabular-nums text-foreground">{cell.value}</span>
            </Link>
          )
        })}
      </div>
    </Card>
  )
}

function Site({ scope }: { scope: Scope }) {
  const site = useDaily(SITE_PATH, scope.range)
  const siteBefore = useDaily(SITE_PATH, scope.prev)
  const blog = useDaily(BLOG_PATH, scope.range)
  const blogBefore = useDaily(BLOG_PATH, scope.prev)
  const pages = usePages(scope.range)
  const top = useTopPosts(scope.range, 5)
  const t = useMemo(() => sumDaily(site.data ?? []), [site.data])
  const p = useMemo(() => sumDaily(siteBefore.data ?? []), [siteBefore.data])
  const share = t.visitors ? (sumDaily(blog.data ?? []).visitors / t.visitors) * 100 : null
  const shareBefore = p.visitors ? (sumDaily(blogBefore.data ?? []).visitors / p.visitors) * 100 : null
  const loading = site.isLoading || siteBefore.isLoading
  const periodLabel = PERIODS.find((x) => x.value === scope.period)?.label ?? ""
  const cells: Array<{ label: string; value: string; change: ChangeText | null; suffix?: string }> = [
    { label: "Visitors", value: formatCount(t.visitors), change: changeText(t.visitors, p.visitors), suffix: "vs previous" },
    { label: "Page views", value: formatCount(t.views), change: changeText(t.views, p.views) },
    { label: "Conversions", value: formatCount(t.conversions), change: changeText(t.conversions, p.conversions) },
    { label: "Blog share of visits", value: share === null ? "n/a" : `${Math.round(share)}%`, change: pointsText(share, shareBefore) },
  ]
  const topPages = (pages.data ?? []).slice(0, 5)
  const topPosts = top.data ?? []
  const listRow = "grid grid-cols-[20px_minmax(0,1fr)_72px] items-center gap-2.5 border-t border-border/60 py-2 text-sm leading-5 first:border-t-0"
  return (
    <Card padding="lg" className="gap-5 px-6" aria-labelledby="site">
      <Heading id="site" title="Whole website" sub={`easner.com, ${periodLabel}`} action={<Link href="/analytics" className="whitespace-nowrap text-sm font-medium leading-5 text-primary-text hover:underline">Open Analytics</Link>} />
      <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
        {cells.map((cell) => (
          <div key={cell.label} className="grid gap-0.5">
            <span className={subtle}>{cell.label}</span>
            {loading ? <Skeleton className="h-7 w-20" /> : <b className="text-xl font-semibold leading-7 tabular-nums">{cell.value}</b>}
            {loading ? null : <Delta change={cell.change} suffix={cell.suffix} />}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <p className={cn(overline, "mb-1.5")}>Top pages</p>
          <ol>
            {topPages.map((page, i) => (
              <li key={page.path} className={listRow}>
                <span className="tabular-nums text-muted-foreground">{i + 1}</span>
                <span className="truncate font-mono text-xs">{page.path}</span>
                <span className="text-right font-medium tabular-nums">{formatCount(page.views)}</span>
              </li>
            ))}
          </ol>
        </div>
        <div>
          <p className={cn(overline, "mb-1.5")}>Top posts</p>
          <ol>
            {topPosts.map((post, i) => (
              <li key={post.post_id} className={listRow}>
                <span className="tabular-nums text-muted-foreground">{i + 1}</span>
                <Link href={`/posts/${post.post_id}`} className="truncate hover:underline">{post.title || "Untitled"}</Link>
                <span className="text-right font-medium tabular-nums">{formatCount(post.views)}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </Card>
  )
}

function AnalyticsBlocks({ scope, posts, categories, today, now }: { scope: Scope; posts: OverviewPost[]; categories: Array<{ id: string; name: string }>; today: string; now: number }) {
  return (
    <>
      <Kpis scope={scope} />
      <BlogViews scope={scope} posts={posts} />
      <TopPosts scope={scope} posts={posts} />
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Sources scope={scope} />
        <Searches today={today} />
      </div>
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Categories scope={scope} posts={posts} categories={categories} />
        <Pipeline posts={posts} scope={scope} now={now} />
      </div>
      <Site scope={scope} />
    </>
  )
}

// ---------------------------------------------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------------------------------------------

function OverviewInner({ posts: postsProp, categories, role, userId, updatedAt, error, onRetry }: OverviewViewProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const raw = searchParams.get("period")
  const period: Period = PERIODS.some((p) => p.value === raw) ? (raw as Period) : "30d"

  const [now] = useState(() => Date.now())
  const [today] = useState(() => isoDay(new Date()))
  const posts = useMemo(() => postsProp ?? [], [postsProp])
  const status = useAnalyticsStatus()
  const scope = useMemo<Scope>(() => {
    const range = rangeForPeriod(period, today)
    return { period, range, prev: previousRange(range), label: PERIODS.find((p) => p.value === period)?.label ?? "" }
  }, [period, today])

  const rows = useMemo(() => buildRows(posts, role, userId, now), [posts, role, userId, now])
  const firstLoad = postsProp === undefined && !error
  const minutes = updatedAt ? Math.max(0, Math.round((now - updatedAt) / 60000)) : null
  const updated = minutes === null ? "" : minutes === 0 ? "Updated just now." : `Updated ${minutes} min ago.`
  const s = status.data

  return (
    <div className="grid content-start gap-6">
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

      {error && !postsProp ? (
        <Card padding="none">
          <EmptyState
            icon={LayoutDashboard}
            title="Overview didn’t load"
            message="Check your connection and try again."
            actions={<Button type="button" variant="outline" size="sm" onClick={onRetry}>Try again</Button>}
          />
        </Card>
      ) : firstLoad ? (
        <div className="grid gap-4" aria-busy="true" aria-label="Loading overview">
          <Skeleton className="h-28 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
      ) : posts.length === 0 ? (
        <Card padding="none">
          <EmptyState
            icon={LayoutDashboard}
            title="Write your first post"
            message="Posts waiting for review and the state of your pipeline will show here."
            actions={<Button asChild variant="primary" size="sm"><Link href="/posts/new">New post</Link></Button>}
          />
        </Card>
      ) : (
        <>
          <NeedsYou rows={rows} />
          {status.isLoading ? (
            <div className="grid gap-4" aria-busy="true" aria-label="Loading analytics">
              <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
                {Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
              </div>
              <Skeleton className="h-72 w-full rounded-xl" />
            </div>
          ) : s?.state === "ready" ? (
            <AnalyticsBlocks scope={scope} posts={posts} categories={categories} today={today} now={now} />
          ) : (
            <>
              {s?.state === "connect" ? <ConnectState missing={s.missing} /> : s?.state === "waiting" ? <ConnectState waiting /> : null}
              {status.isError ? (
                <Card padding="none">
                  <EmptyState icon={LayoutDashboard} title="Analytics didn’t load" message="Check your connection and try again." actions={<Button type="button" variant="outline" size="sm" onClick={() => void status.refetch()}>Try again</Button>} />
                </Card>
              ) : null}
              <Pipeline posts={posts} scope={scope} now={now} />
            </>
          )}
        </>
      )}
    </div>
  )
}

export function OverviewView(props: OverviewViewProps) {
  return (
    <Suspense fallback={null}>
      <OverviewInner {...props} />
    </Suspense>
  )
}

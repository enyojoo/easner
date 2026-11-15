"use client"

import { Suspense, useMemo, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { CalendarRange, ChartLine, PlugZap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import { FilterTabs } from "@/components/ui/filter-tabs"
import { Input } from "@/components/ui/input"
import { PageHeader } from "@/components/ui/page-header"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { SearchField } from "@/components/ui/search-field"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FilterBar, activeDimension, hasBreakdowns, nextFilterPatch, readFilters, type SiteFilters } from "@/components/analytics/filters"
import { HelpfulSection, LocationSection, SearchSection, SharesSection, SourcesSection, TechSection, VitalsSection } from "@/components/analytics/sections"
import { BarList, Kpi, Section, SectionTitle, TrafficChart } from "@/components/analytics/parts"
import {
  PERIODS, fillDays, formatCount, formatDay, formatDuration, formatPercent, formatRange, parseRange, previousRange, readDepthPercent, sumDaily,
  type Period,
} from "@/lib/analytics/aggregate"
import { useAnalyticsMode, useAnalyticsStatus, useDaily, useDailyBy, useFeedback, usePages, useTopPosts } from "@/lib/analytics/hooks"
import type { DateRange, TopPostRow } from "@/lib/analytics/source"
import { isoDay } from "@/lib/analytics/paths"
import { BLOG_PATH, SITE_PATH } from "@/lib/analytics/types"

type Tab = "website" | "blog"
const TABS = [
  { value: "website" as const, label: "Website" },
  { value: "blog" as const, label: "Blog" },
]

/** Connect state: what is missing and how to fix it. Never shows a key. */
export function ConnectState({ missing, waiting = false }: { missing?: string[]; waiting?: boolean }) {
  return (
    <Card padding="none">
      <EmptyState
        icon={PlugZap}
        title={waiting ? "Waiting for the first nightly sync" : "Connect PostHog to see analytics"}
        message={
          waiting ? (
            <>PostHog is connected. The first rollup runs overnight. To fill the last few weeks now, call the cron route once with <code className="font-mono text-xs">?days=30</code>.</>
          ) : (
            <>
              Add {missing && missing.length ? <code className="font-mono text-xs">{missing.join(", ")}</code> : "the PostHog keys"} to the admin’s environment, then run the nightly job. Search Console is optional and adds Google searches. Steps are in admin/README.md.
            </>
          )
        }
      />
    </Card>
  )
}

function RangePicker({ range, active, onApply }: { range: DateRange; active: boolean; onApply: (range: DateRange) => void }) {
  const [open, setOpen] = useState(false)
  const [from, setFrom] = useState(range.from)
  const [to, setTo] = useState(range.to)
  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        if (next) { setFrom(range.from); setTo(range.to) }
        setOpen(next)
      }}
    >
      <PopoverTrigger asChild>
        <Button type="button" variant={active ? "secondary" : "outline"} size="sm" aria-label="Choose a custom date range">
          <CalendarRange className="size-4" aria-hidden />
          {active ? formatRange(range) : "Custom"}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72 space-y-3">
        <label className="block space-y-1 text-sm font-medium text-foreground">
          From
          <Input type="date" value={from} max={to} onChange={(e) => setFrom(e.target.value)} />
        </label>
        <label className="block space-y-1 text-sm font-medium text-foreground">
          To
          <Input type="date" value={to} min={from} onChange={(e) => setTo(e.target.value)} />
        </label>
        <div className="flex justify-end">
          <Button
            type="button"
            variant="primary"
            size="sm"
            disabled={!from || !to}
            onClick={() => {
              onApply({ from, to })
              setOpen(false)
            }}
          >
            Apply
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

function PagesTable({ range }: { range: DateRange }) {
  const query = usePages(range)
  const [find, setFind] = useState("")
  const rows = useMemo(() => (query.data ?? []).filter((r) => r.path.toLowerCase().includes(find.trim().toLowerCase())), [query.data, find])
  return (
    <Section
      flush
      title="Pages"
      description={query.data ? `${query.data.length} pages · sorted by page views` : "Every page on easner.com."}
      actions={<SearchField value={find} onChange={setFind} placeholder="Find a page" aria-label="Find a page" className="w-56" />}
    >
      {query.isLoading ? (
        <Skeleton className="mx-6 mb-6 h-40 w-auto" />
      ) : rows.length === 0 ? (
        <p className="px-6 pb-6 text-sm text-muted-foreground">{find ? "No page matches." : "No page views in this period."}</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Page</TableHead>
              <TableHead className="text-right">Page views</TableHead>
              <TableHead className="text-right">Visitors</TableHead>
              <TableHead className="text-right">Avg. time</TableHead>
              <TableHead className="text-right">Bounce</TableHead>
              <TableHead className="text-right">Exits</TableHead>
              <TableHead className="text-right">Conversions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.slice(0, 15).map((r) => (
              <TableRow key={r.path}>
                <TableCell className="max-w-[300px] truncate font-medium">{r.path}</TableCell>
                <TableCell className="text-right tabular-nums">{formatCount(r.views)}</TableCell>
                <TableCell className="text-right tabular-nums">{formatCount(r.visitors)}</TableCell>
                <TableCell className="text-right tabular-nums">{formatDuration(r.avg_time_s)}</TableCell>
                <TableCell className="text-right tabular-nums">{r.entries > 0 ? formatPercent(r.bounces / r.entries) : "n/a"}</TableCell>
                <TableCell className="text-right tabular-nums">{formatCount(r.exits)}</TableCell>
                <TableCell className="text-right tabular-nums">{formatCount(r.conversions)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      {rows.length > 15 ? <p className="border-t border-border/50 px-6 py-3 text-xs text-muted-foreground">Showing the top 15 of {rows.length} pages.</p> : null}
    </Section>
  )
}

function WebsiteTab({ range, filters, compare }: { range: DateRange; filters: SiteFilters; compare: boolean }) {
  const prev = useMemo(() => previousRange(range), [range])
  const scope = filters.page || SITE_PATH
  // Lists (sources, places, devices) exist for the whole site, the blog and blog posts only.
  const listScope = hasBreakdowns(scope) ? scope : SITE_PATH
  const narrow = activeDimension(filters)
  // Whole site or one page: the full daily rollup. Narrowed by country, device or source: that dimension's daily rows (visitors and views only).
  const full = useDaily(scope, range, !narrow)
  const fullBefore = useDaily(scope, prev, !narrow && compare)
  const by = useDailyBy(scope, range, narrow?.dimension ?? "country", narrow?.value ?? "", Boolean(narrow))
  const byBefore = useDailyBy(scope, prev, narrow?.dimension ?? "country", narrow?.value ?? "", Boolean(narrow) && compare)
  const current = narrow ? by : full
  const before = narrow ? byBefore : fullBefore
  const loading = current.isLoading || (compare && before.isLoading)
  const t = useMemo(() => sumDaily(current.data ?? []), [current.data])
  const p = useMemo(() => sumDaily(before.data ?? []), [before.data])
  const points = useMemo(() => fillDays(current.data ?? [], range), [current.data, range])
  const previous = useMemo(() => (compare ? fillDays(before.data ?? [], prev) : undefined), [compare, before.data, prev])
  const cmp = (value: number | null) => (compare ? value : undefined)
  const off = compare ? undefined : "Comparison off"
  const unsplit = narrow ? `Not counted per ${narrow.dimension}` : undefined
  const ratio = (x: number | null) => (x === null ? "n/a" : x.toFixed(2))
  return (
    <div className="space-y-8">
      <section aria-label="Key numbers" className="space-y-3">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
          <Kpi loading={loading} label="Visitors" value={formatCount(t.visitors)} current={t.visitors} previous={cmp(p.visitors)} hint={off} />
          <Kpi loading={loading} label="Page views" value={formatCount(t.views)} current={t.views} previous={cmp(p.views)} hint={off} />
          <Kpi loading={loading} label="Views per visit" value={ratio(t.viewsPerVisit)} current={t.viewsPerVisit} previous={cmp(p.viewsPerVisit)} hint={off} />
          <Kpi loading={loading} label="Avg. time on page" value={narrow ? "n/a" : formatDuration(t.avgTimeS)} current={narrow ? undefined : t.avgTimeS} previous={narrow ? undefined : cmp(p.avgTimeS)} hint={unsplit ?? off} />
          <Kpi loading={loading} label="Bounce rate" value={narrow ? "n/a" : formatPercent(t.bounceRate)} current={narrow ? undefined : t.bounceRate} previous={narrow ? undefined : cmp(p.bounceRate)} hint={unsplit ?? off} />
          <Kpi loading={loading} label="Conversions" value={narrow ? "n/a" : formatCount(t.conversions)} current={narrow ? undefined : t.conversions} previous={narrow ? undefined : cmp(p.conversions)} hint={unsplit ?? off} />
        </div>
        <p className="text-xs text-muted-foreground">
          Visitors are counted per day and added up, so someone who returns on another day counts again. Visits from EU and UK people who decline cookies are counted without cookies, so returning visitor figures are lower bounds. Conversions are clicks to open an account, sign up or download the app.
          {narrow ? " The source, location and technology lists ignore the country, device and source filter: the nightly rollups count each of those on its own." : ""}
          {!hasBreakdowns(scope) ? " Sources, places and devices are rolled up for the whole site, the blog and each post, not for other pages, so those lists show the whole site." : ""}
        </p>
      </section>

      <Section title="Traffic" description={`Visitors and page views per day, ${formatRange(range)}`}>
        {loading ? <Skeleton className="h-60 w-full" /> : <TrafficChart points={points} previous={previous} />}
      </Section>

      <PagesTable range={range} />

      <section aria-labelledby="sources" className="space-y-3">
        <SectionTitle id="sources">Sources</SectionTitle>
        <SourcesSection range={range} path={listScope} />
      </section>
      <section aria-labelledby="location" className="space-y-3">
        <SectionTitle id="location">Location</SectionTitle>
        <LocationSection range={range} path={listScope} />
      </section>
      <section aria-labelledby="tech" className="space-y-3">
        <SectionTitle id="tech">Technology</SectionTitle>
        <TechSection range={range} path={listScope} />
      </section>
      <section aria-labelledby="search" className="space-y-3">
        <SectionTitle id="search">Search</SectionTitle>
        <SearchSection range={range} scope="site" title="Google searches for the whole site" />
      </section>
      <section aria-labelledby="health" className="space-y-3">
        <SectionTitle id="health">Site health</SectionTitle>
        <VitalsSection range={range} />
      </section>
    </div>
  )
}

function sumTop(rows: TopPostRow[] | undefined) {
  const r = rows ?? []
  const readers = r.reduce((s, x) => s + x.readers, 0)
  return {
    views: r.reduce((s, x) => s + x.views, 0), readers,
    depth: readDepthPercent(r.reduce((s, x) => s + x.depth_25, 0), r.reduce((s, x) => s + x.depth_50, 0), r.reduce((s, x) => s + x.depth_75, 0), r.reduce((s, x) => s + x.depth_100, 0), readers),
    d: [25, 50, 75, 100].map((n) => r.reduce((s, x) => s + (n === 25 ? x.depth_25 : n === 50 ? x.depth_50 : n === 75 ? x.depth_75 : x.depth_100), 0)),
    signups: r.reduce((s, x) => s + x.signups, 0), shares: r.reduce((s, x) => s + x.share_clicks, 0),
  }
}

function BlogTab({ range, compare }: { range: DateRange; compare: boolean }) {
  const prev = useMemo(() => previousRange(range), [range])
  const now = useTopPosts(range, 200)
  const before = useTopPosts(prev, 200, compare)
  const daily = useDaily(BLOG_PATH, range)
  const dailyBefore = useDaily(BLOG_PATH, prev, compare)
  const feedback = useFeedback()
  const loading = now.isLoading || (compare && before.isLoading)
  const cmp = (value: number | null) => (compare ? value : undefined)
  const off = compare ? undefined : "Comparison off"

  const t = useMemo(() => sumTop(now.data), [now.data])
  const p = useMemo(() => sumTop(before.data), [before.data])
  const votes = feedback.data ?? []
  const yes = votes.filter((v) => v.helpful).reduce((s, v) => s + v.votes, 0)
  const total = votes.reduce((s, v) => s + v.votes, 0)

  const points = useMemo(() => fillDays(daily.data ?? [], range), [daily.data, range])
  const previous = useMemo(() => (compare ? fillDays(dailyBefore.data ?? [], prev) : undefined), [compare, dailyBefore.data, prev])

  return (
    <div className="space-y-8">
      <section aria-label="Key numbers" className="space-y-3">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
          <Kpi loading={loading} label="Views" value={formatCount(t.views)} current={t.views} previous={cmp(p.views)} hint={off} />
          <Kpi loading={loading} label="Readers" value={formatCount(t.readers)} current={t.readers} previous={cmp(p.readers)} hint={off} />
          <Kpi loading={loading} label="Avg. read depth" value={t.depth === null ? "n/a" : `${Math.round(t.depth)}%`} current={t.depth} previous={cmp(p.depth)} hint={off} />
          <Kpi loading={loading} label="Sign-up clicks" value={formatCount(t.signups)} current={t.signups} previous={cmp(p.signups)} hint={off} />
          <Kpi loading={loading} label="Share clicks" value={formatCount(t.shares)} current={t.shares} previous={cmp(p.shares)} hint={off} />
          <Kpi loading={feedback.isLoading} label="Helpful" value={total ? formatPercent(yes / total) : "n/a"} hint={total ? `${formatCount(total)} votes, all time` : "No votes yet"} />
        </div>
      </section>

      <Section title="Blog traffic" description={formatRange(range)}>
        {daily.isLoading ? <Skeleton className="h-60 w-full" /> : <TrafficChart points={points} previous={previous} labels={{ a: "Readers", b: "Views" }} />}
      </Section>

      <Section flush title="Top posts" description="Click a post to open it. Its Performance tab has the same numbers for that post alone.">
        {loading ? (
          <Skeleton className="mx-6 mb-6 h-40 w-auto" />
        ) : (now.data ?? []).length === 0 ? (
          <p className="px-6 pb-6 text-sm text-muted-foreground">No post views in this period.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Post</TableHead>
                <TableHead className="text-right">Views</TableHead>
                <TableHead className="text-right">Readers</TableHead>
                <TableHead className="text-right">Read depth</TableHead>
                <TableHead className="text-right">Sign-up clicks</TableHead>
                <TableHead className="text-right">Shares</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(now.data ?? []).slice(0, 10).map((post) => (
                <TableRow key={post.post_id}>
                  <TableCell className="max-w-[420px]">
                    <Link href={`/posts/${post.post_id}`} className="block truncate font-medium text-foreground hover:underline">{post.title || "Untitled"}</Link>
                    <span className="block truncate text-xs text-muted-foreground">{post.category_name ?? "No category"}</span>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{formatCount(post.views)}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatCount(post.readers)}</TableCell>
                  <TableCell className="text-right tabular-nums">{(() => { const d = readDepthPercent(post.depth_25, post.depth_50, post.depth_75, post.depth_100, post.readers); return d === null ? "n/a" : `${Math.round(d)}%` })()}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatCount(post.signups)}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatCount(post.share_clicks)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Section title="Read depth" description="Share of readers who reached each point in a post.">
          {loading ? (
            <Skeleton className="h-32 w-full" />
          ) : (
            <BarList
              rows={[25, 50, 75, 100].map((n, i) => ({ value: `${n}% of the post`, visitors: t.readers ? Math.round((t.d[i] / t.readers) * 1000) / 10 : 0, views: 0 }))}
              noun="percent of readers"
              valueFormat={(v) => `${v}%`}
              showShare={false}
              maxValue={100}
              empty="No reads in this period."
            />
          )}
        </Section>
        <SharesSection range={range} path={BLOG_PATH} />
      </div>

      <section aria-labelledby="blog-sources" className="space-y-3">
        <SectionTitle id="blog-sources">Where readers come from</SectionTitle>
        <SourcesSection range={range} path={BLOG_PATH} />
      </section>
      <section aria-labelledby="blog-location" className="space-y-3">
        <SectionTitle id="blog-location">Location</SectionTitle>
        <LocationSection range={range} path={BLOG_PATH} />
      </section>
      <section aria-labelledby="blog-tech" className="space-y-3">
        <SectionTitle id="blog-tech">Devices</SectionTitle>
        <TechSection range={range} path={BLOG_PATH} compact />
      </section>
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <SearchSection range={range} scope="blog" />
        <HelpfulSection />
      </div>
    </div>
  )
}

function AnalyticsInner() {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const mode = useAnalyticsMode()
  const [today] = useState(() => isoDay(new Date()))
  const status = useAnalyticsStatus()

  const tab: Tab = params.get("tab") === "blog" ? "blog" : "website"
  const { period, range } = useMemo(() => parseRange({ period: params.get("period"), from: params.get("from"), to: params.get("to") }, today), [params, today])

  const filters = useMemo(() => readFilters((key) => params.get(key)), [params])
  const compare = params.get("compare") !== "0"

  const push = (patch: Record<string, string | null>) => {
    const next = new URLSearchParams(params.toString())
    for (const [key, value] of Object.entries(patch)) {
      if (value === null) next.delete(key)
      else next.set(key, value)
    }
    const query = next.toString()
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
  }

  const s = status.data
  const description =
    s?.state === "ready"
      ? `Every page on easner.com. ${s.lastDay ? `Updated nightly, latest day ${formatDay(s.lastDay)}.` : ""}`
      : "Every page on easner.com. Filters are in the URL, so you can share this view."

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        description={description}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <FilterTabs<Period>
              variant="pills"
              ariaLabel="Period"
              tabs={PERIODS.map((x) => ({ value: x.value, label: x.label }))}
              value={(period === "custom" ? "" : period) as Period}
              onChange={(value) => push({ period: value === "30d" ? null : value, from: null, to: null })}
            />
            <RangePicker range={range} active={period === "custom"} onApply={(r) => push({ period: null, from: r.from, to: r.to })} />
          </div>
        }
      />
      {mode === "sample" ? (
        <p className="rounded-lg bg-warning-surface px-4 py-2 text-sm text-warning-text">Sample data for review. Nothing here is real.</p>
      ) : null}

      {status.isLoading ? (
        <div className="space-y-4" aria-busy="true" aria-label="Loading analytics">
          <Skeleton className="h-10 w-48" />
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-6">
            {Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
          </div>
          <Skeleton className="h-72 w-full rounded-xl" />
        </div>
      ) : s?.state === "connect" ? (
        <ConnectState missing={s.missing} />
      ) : s?.state === "waiting" ? (
        <ConnectState waiting />
      ) : status.isError ? (
        <Card padding="none">
          <EmptyState icon={ChartLine} title="Analytics didn’t load" message="Check your connection and try again." actions={<Button type="button" variant="outline" size="sm" onClick={() => void status.refetch()}>Try again</Button>} />
        </Card>
      ) : (
        <>
          <FilterTabs<Tab> variant="underline" ariaLabel="Analytics section" tabs={TABS} value={tab} onChange={(value) => push({ tab: value === "website" ? null : value })} />
          <FilterBar
            range={range}
            filters={filters}
            compare={compare}
            showFilters={tab === "website"}
            onFilter={(key, value) => push(nextFilterPatch(filters, key, value))}
            onCompare={(on) => push({ compare: on ? null : "0" })}
          />
          {tab === "website" ? <WebsiteTab range={range} filters={filters} compare={compare} /> : <BlogTab range={range} compare={compare} />}
        </>
      )}
    </div>
  )
}

export function AnalyticsView() {
  return (
    <Suspense fallback={null}>
      <AnalyticsInner />
    </Suspense>
  )
}

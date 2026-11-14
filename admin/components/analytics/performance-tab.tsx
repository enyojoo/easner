"use client"

import { useMemo, useState } from "react"
import { ChartLine } from "lucide-react"
import { FilterTabs } from "@/components/ui/filter-tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { BarList, Delta, TrafficChart } from "@/components/analytics/parts"
import { CHANNEL_LABELS } from "@/lib/analytics/classify"
import { countryName, fillDays, formatCount, formatDuration, formatPercent, groupSmall, previousRange, rangeForPeriod, readDepthPercent, sumBlog, topWithOther } from "@/lib/analytics/aggregate"
import { useBreakdown, useFeedback, usePostDaily, useSearch } from "@/lib/analytics/hooks"
import { isoDay } from "@/lib/analytics/paths"
import type { Channel } from "@/lib/analytics/types"

type Window = "7d" | "30d" | "90d"
const WINDOWS = [
  { value: "7d" as const, label: "7 days" },
  { value: "30d" as const, label: "30 days" },
  { value: "90d" as const, label: "90 days" },
]

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2.5 border-b border-border px-5 py-5 last:border-b-0">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      {children}
    </section>
  )
}

function Stat({ label, value, current, previous, hint }: { label: string; value: string; current?: number | null; previous?: number | null; hint?: string }) {
  return (
    <div className="min-w-0 rounded-lg bg-muted/50 px-3 py-2.5">
      <p className="truncate text-xs text-muted-foreground">{label}</p>
      <p className="truncate text-lg font-semibold tabular-nums text-foreground">{value}</p>
      {current !== undefined && previous !== undefined ? <Delta current={current} previous={previous} /> : hint ? <span className="text-xs text-muted-foreground">{hint}</span> : null}
    </div>
  )
}

const NETWORK: Record<string, string> = { x: "X", linkedin: "LinkedIn", whatsapp: "WhatsApp", copy: "Copy link", native: "Share sheet", facebook: "Facebook" }
const REASONS: Record<string, string> = { out_of_date: "Out of date", not_what_i_was_looking_for: "Not what I was looking for", too_technical: "Too technical", missing_my_country: "Missing my country" }

/** The editor's Performance tab: the Analytics Blog view scoped to one post. Reads the rollups, so it is as fresh as last night. */
export function PerformanceTab({ postId, slug, status }: { postId: string; slug: string; status: string }) {
  const [window, setWindow] = useState<Window>("30d")
  const [today] = useState(() => isoDay(new Date()))
  const range = useMemo(() => rangeForPeriod(window, today), [window, today])
  const prev = useMemo(() => previousRange(range), [range])
  const path = `/blog/${slug}`
  const live = status === "published" || status === "scheduled"

  const now = usePostDaily(postId, range)
  const before = usePostDaily(postId, prev)
  const sources = useBreakdown(range, path, "source", live)
  const countries = useBreakdown(range, path, "country", live)
  const cities = useBreakdown(range, path, "city", live)
  const visits = useBreakdown(range, path, "share_visit", live)
  const search = useSearch(range, "blog", postId)
  const feedback = useFeedback(postId)

  const t = useMemo(() => sumBlog(now.data ?? []), [now.data])
  const p = useMemo(() => sumBlog(before.data ?? []), [before.data])
  const points = useMemo(() => fillDays((now.data ?? []).map((r) => ({ date: r.date, visitors: r.readers, views: r.views })), range), [now.data, range])
  const shares = useMemo(() => {
    const totals: Record<string, number> = {}
    for (const row of now.data ?? []) for (const [network, n] of Object.entries(row.shares)) totals[network] = (totals[network] ?? 0) + n
    return Object.entries(totals).sort((a, b) => b[1] - a[1])
  }, [now.data])
  const votes = feedback.data ?? []
  const yes = votes.filter((v) => v.helpful).reduce((s, v) => s + v.votes, 0)
  const all = votes.reduce((s, v) => s + v.votes, 0)
  const reasons = Object.entries(votes.filter((v) => !v.helpful && v.reason).reduce<Record<string, number>>((acc, v) => ({ ...acc, [v.reason!]: (acc[v.reason!] ?? 0) + v.votes }), {})).sort((a, b) => b[1] - a[1])

  if (!live) {
    return (
      <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
        <span className="inline-flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <ChartLine className="size-[22px]" aria-hidden />
        </span>
        <h3 className="text-base font-semibold text-foreground">Performance starts at publish</h3>
        <p className="max-w-[300px] text-sm text-muted-foreground">Views, readers, sources and searches for this post show here the day after it goes live.</p>
      </div>
    )
  }

  const loading = now.isLoading
  const depth = t.avgDepth
  const readersTotal = t.readers
  return (
    <div>
      <div className="flex items-center justify-between px-5 pt-4">
        <p className="text-xs text-muted-foreground">Updated nightly</p>
        <FilterTabs<Window> variant="pills" ariaLabel="Performance period" tabs={WINDOWS} value={window} onChange={setWindow} />
      </div>
      <Block title="Summary">
        {loading ? (
          <Skeleton className="h-24 w-full" />
        ) : (
          <div className="grid grid-cols-2 gap-2.5">
            <Stat label="Views" value={formatCount(t.views)} current={t.views} previous={p.views} />
            <Stat label="Readers" value={formatCount(t.readers)} current={t.readers} previous={p.readers} />
            <Stat label="Avg. read depth" value={depth === null ? "n/a" : `${Math.round(depth)}%`} current={depth} previous={p.avgDepth} />
            <Stat label="Avg. time on page" value={formatDuration(avgTime(now.data ?? []))} />
            <Stat label="Sign-up clicks" value={formatCount(t.signups)} current={t.signups} previous={p.signups} />
            <Stat label="Share clicks" value={formatCount(t.shareClicks)} current={t.shareClicks} previous={p.shareClicks} />
          </div>
        )}
      </Block>
      <Block title="Readers over time">{loading ? <Skeleton className="h-40 w-full" /> : <TrafficChart points={points} compact labels={{ a: "Readers", b: "Views" }} />}</Block>
      <Block title="Read depth">
        <BarList
          rows={[25, 50, 75, 100].map((n, i) => ({ value: `${n}% of the post`, visitors: readersTotal ? Math.round(([t.depth.d25, t.depth.d50, t.depth.d75, t.depth.d100][i] / readersTotal) * 1000) / 10 : 0, views: 0 }))}
          noun="percent of readers"
              valueFormat={(v) => `${v}%`}
              showShare={false}
              maxValue={100}
          loading={loading}
        />
      </Block>
      <Block title="Where readers come from">
        <BarList rows={sources.data} label={(v) => CHANNEL_LABELS[v as Channel] ?? v} loading={sources.isLoading} limit={6} />
      </Block>
      <Block title="Countries">
        <BarList rows={countries.data && topWithOther(countries.data, 6)} label={countryName} loading={countries.isLoading} limit={7} />
      </Block>
      <Block title="Cities">
        <p className="text-xs text-muted-foreground">Cities with fewer than 5 visitors are grouped as Other.</p>
        <BarList rows={cities.data && topWithOther(groupSmall(cities.data), 6)} loading={cities.isLoading} limit={7} />
      </Block>
      <Block title="Shares">
        {shares.length === 0 ? (
          <p className="text-sm text-muted-foreground">No shares in this period.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-muted-foreground">
                <th className="py-1 font-medium">Network</th>
                <th className="py-1 text-right font-medium">Clicks</th>
                <th className="py-1 text-right font-medium">Visits back</th>
              </tr>
            </thead>
            <tbody>
              {shares.map(([network, clicks]) => (
                <tr key={network} className="border-t border-border/60">
                  <td className="py-1.5">{NETWORK[network] ?? network}</td>
                  <td className="py-1.5 text-right tabular-nums">{formatCount(clicks)}</td>
                  <td className="py-1.5 text-right tabular-nums">{formatCount(visits.data?.find((v) => v.value === network)?.views ?? 0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Block>
      <Block title="Google searches">
        {(search.data ?? []).length === 0 ? (
          <p className="text-sm text-muted-foreground">No searches yet. They come from Search Console, about three days behind.</p>
        ) : (
          <ul className="space-y-1.5">
            {(search.data ?? []).slice(0, 5).map((q) => (
              <li key={q.query} className="flex items-baseline justify-between gap-3 text-sm">
                <span className="min-w-0 truncate" title={q.query}>{q.query}</span>
                <span className="shrink-0 text-xs tabular-nums text-muted-foreground">{formatCount(q.clicks)} clicks, position {q.avg_position === null ? "n/a" : q.avg_position.toFixed(1)}</span>
              </li>
            ))}
          </ul>
        )}
      </Block>
      <Block title="Was this helpful?">
        {all === 0 ? (
          <p className="text-sm text-muted-foreground">No votes yet.</p>
        ) : (
          <div className="space-y-3">
            <p className="text-lg font-semibold tabular-nums text-foreground">{formatPercent(yes / all)} <span className="text-sm font-normal text-muted-foreground">helpful, {formatCount(all)} votes</span></p>
            {reasons.length ? <BarList rows={reasons.map(([value, n]) => ({ value, visitors: n, views: n }))} label={(v) => REASONS[v] ?? v} noun="votes" /> : null}
          </div>
        )}
      </Block>
    </div>
  )
}

function avgTime(rows: Array<{ avg_time_s: number | null; views: number }>): number | null {
  let w = 0
  let n = 0
  for (const r of rows) if (r.avg_time_s !== null) { w += r.avg_time_s * r.views; n += r.views }
  return n > 0 ? w / n : null
}

export { readDepthPercent }

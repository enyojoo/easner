/** Pure helpers for the dashboard: ranges, totals, deltas, the city threshold, formatting. Tested in aggregate.test.ts. */
import type { DateRange } from "./source.ts"
import { addDays } from "./paths.ts"
import type { BlogStatsRow, SiteStatsRow, VitalMetric } from "./types.ts"

export type Period = "7d" | "30d" | "90d" | "12m"
export const PERIODS: ReadonlyArray<{ value: Period; label: string; days: number }> = [
  { value: "7d", label: "7 days", days: 7 },
  { value: "30d", label: "30 days", days: 30 },
  { value: "90d", label: "90 days", days: 90 },
  { value: "12m", label: "12 months", days: 365 },
]

/** Rollups are complete through yesterday (UTC), so every range ends there. */
export function rangeForPeriod(period: Period, today: string): DateRange {
  const days = PERIODS.find((p) => p.value === period)?.days ?? 30
  const to = addDays(today, -1)
  return { from: addDays(to, -(days - 1)), to }
}

export function daysIn(range: DateRange): number {
  return Math.round((Date.parse(`${range.to}T00:00:00Z`) - Date.parse(`${range.from}T00:00:00Z`)) / 86_400_000) + 1
}

/** The range of the same length that ends the day before `range` starts. */
export function previousRange(range: DateRange): DateRange {
  const length = daysIn(range)
  return { from: addDays(range.from, -length), to: addDays(range.from, -1) }
}

const ISO = /^\d{4}-\d{2}-\d{2}$/

/** Period or custom range from the URL. Anything invalid falls back to 30 days. A custom range is capped at two years. */
export function parseRange(params: { period?: string | null; from?: string | null; to?: string | null }, today: string): { period: Period | "custom"; range: DateRange } {
  const yesterday = addDays(today, -1)
  if (params.from && params.to && ISO.test(params.from) && ISO.test(params.to) && Number.isFinite(Date.parse(params.from)) && Number.isFinite(Date.parse(params.to))) {
    let { from, to } = params
    if (from > to) [from, to] = [to, from]
    if (to > yesterday) to = yesterday
    if (from > to) from = to
    const floor = addDays(to, -729)
    if (from < floor) from = floor
    return { period: "custom", range: { from, to } }
  }
  const period = PERIODS.find((p) => p.value === params.period)?.value ?? "30d"
  return { period, range: rangeForPeriod(period, today) }
}

export interface Totals {
  visitors: number
  views: number
  avgTimeS: number | null
  bounceRate: number | null
  conversions: number
  viewsPerVisit: number | null
}

export function sumDaily(rows: SiteStatsRow[]): Totals {
  let visitors = 0, views = 0, bounces = 0, entries = 0, conversions = 0, timeWeighted = 0, timeViews = 0
  for (const r of rows) {
    visitors += r.visitors
    views += r.views
    bounces += r.bounces
    entries += r.entries
    conversions += r.conversions
    if (r.avg_time_s !== null) { timeWeighted += r.avg_time_s * r.views; timeViews += r.views }
  }
  return {
    visitors, views, conversions,
    avgTimeS: timeViews > 0 ? timeWeighted / timeViews : null,
    bounceRate: entries > 0 ? bounces / entries : null,
    viewsPerVisit: visitors > 0 ? views / visitors : null,
  }
}

export interface BlogTotals {
  views: number
  readers: number
  avgDepth: number | null
  signups: number
  shareClicks: number
  shareVisits: number
  ctaClicks: number
}

/** Average read depth as a percentage: each reader fires 25, 50, 75, 100 as they go, so 25 × (events ÷ readers). */
export function readDepthPercent(d25: number, d50: number, d75: number, d100: number, readers: number): number | null {
  if (readers <= 0) return null
  return Math.min(100, (25 * (d25 + d50 + d75 + d100)) / readers)
}

export function sumBlog(rows: BlogStatsRow[]): BlogTotals & { depth: { d25: number; d50: number; d75: number; d100: number } } {
  const t = { views: 0, readers: 0, signups: 0, shareClicks: 0, shareVisits: 0, ctaClicks: 0, d25: 0, d50: 0, d75: 0, d100: 0 }
  for (const r of rows) {
    t.views += r.views; t.readers += r.readers; t.signups += r.signups; t.shareClicks += r.share_clicks
    t.shareVisits += r.share_visits; t.ctaClicks += r.cta_clicks
    t.d25 += r.depth_25; t.d50 += r.depth_50; t.d75 += r.depth_75; t.d100 += r.depth_100
  }
  return {
    views: t.views, readers: t.readers, signups: t.signups, shareClicks: t.shareClicks, shareVisits: t.shareVisits, ctaClicks: t.ctaClicks,
    avgDepth: readDepthPercent(t.d25, t.d50, t.d75, t.d100, t.readers),
    depth: { d25: t.d25, d50: t.d50, d75: t.d75, d100: t.d100 },
  }
}

/** Change from `previous` to `current` as a fraction (0.12 = up 12%). Null when there is nothing to compare with. */
export function change(current: number | null, previous: number | null): number | null {
  if (current === null || previous === null || previous === 0) return null
  return (current - previous) / previous
}

// ---------------------------------------------------------------------------------------------------------------
// Breakdowns
// ---------------------------------------------------------------------------------------------------------------

export const CITY_MIN_VISITORS = 5
export const OTHER = "Other"

export interface Counted {
  value: string
  visitors: number
  views: number
}

/** Cities with fewer than `min` visitors in the period become one "Other" row, so no one can be singled out. */
export function groupSmall(rows: Counted[], min = CITY_MIN_VISITORS): Counted[] {
  const big: Counted[] = []
  let other: Counted | null = null
  for (const row of rows) {
    if (row.value === OTHER || row.visitors < min) {
      other = other ?? { value: OTHER, visitors: 0, views: 0 }
      other.visitors += row.visitors
      other.views += row.views
    } else {
      big.push(row)
    }
  }
  big.sort((a, b) => b.visitors - a.visitors || a.value.localeCompare(b.value))
  return other ? [...big, other] : big
}

/** Top `limit` rows plus a rolled-up "Other" row for the rest. */
export function topWithOther(rows: Counted[], limit: number): Counted[] {
  if (rows.length <= limit) return rows
  const head = rows.slice(0, limit)
  const rest = rows.slice(limit).reduce((acc, r) => ({ value: OTHER, visitors: acc.visitors + r.visitors, views: acc.views + r.views }), { value: OTHER, visitors: 0, views: 0 })
  return [...head, rest]
}

const regionNames = (() => {
  try {
    return new Intl.DisplayNames(["en"], { type: "region" })
  } catch {
    return null
  }
})()

export function countryName(code: string): string {
  if (code === OTHER) return OTHER
  try {
    return regionNames?.of(code.toUpperCase()) ?? code
  } catch {
    return code
  }
}

// ---------------------------------------------------------------------------------------------------------------
// Web vitals
// ---------------------------------------------------------------------------------------------------------------

export type VitalStatus = "good" | "needs improvement" | "poor"
const THRESHOLDS: Record<VitalMetric, [number, number]> = { LCP: [2500, 4000], INP: [200, 500], CLS: [0.1, 0.25], FCP: [1800, 3000] }

export function vitalStatus(metric: VitalMetric, value: number): VitalStatus {
  const [good, poor] = THRESHOLDS[metric]
  return value <= good ? "good" : value <= poor ? "needs improvement" : "poor"
}

export function formatVital(metric: VitalMetric, value: number): string {
  if (metric === "CLS") return value.toFixed(2)
  return value >= 1000 ? `${(value / 1000).toFixed(1)} s` : `${Math.round(value)} ms`
}

// ---------------------------------------------------------------------------------------------------------------
// Formatting
// ---------------------------------------------------------------------------------------------------------------

export function formatCount(n: number | null | undefined): string {
  if (n === null || n === undefined) return "n/a"
  return new Intl.NumberFormat("en-US", { notation: n >= 100_000 ? "compact" : "standard", maximumFractionDigits: 1 }).format(n)
}
export function formatPercent(fraction: number | null, digits = 0): string {
  return fraction === null ? "n/a" : `${(fraction * 100).toFixed(digits)}%`
}
export function formatDuration(seconds: number | null): string {
  if (seconds === null) return "n/a"
  const s = Math.round(seconds)
  return s < 60 ? `${s}s` : `${Math.floor(s / 60)}m ${String(s % 60).padStart(2, "0")}s`
}
export function formatDay(day: string): string {
  return new Date(`${day}T00:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" })
}
export function formatRange(range: DateRange): string {
  return `${formatDay(range.from)} to ${formatDay(range.to)}`
}

/** Fills missing days with zeros so a chart's x axis is continuous. */
export function fillDays(rows: Array<{ date: string; visitors: number; views: number }>, range: DateRange) {
  const byDay = new Map(rows.map((r) => [r.date, r]))
  const out: Array<{ date: string; visitors: number; views: number }> = []
  for (let day = range.from; day <= range.to; day = addDays(day, 1)) out.push(byDay.get(day) ?? { date: day, visitors: 0, views: 0 })
  return out
}

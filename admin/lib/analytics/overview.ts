/** Pure helpers for the Overview page (OffBlogOverview): change text, channel grouping, category rollup, chart markers. Tested in overview.test.ts. */
import { addDays } from "./paths.ts"
import type { BreakdownValue, DateRange, TopPostRow } from "./source.ts"

export interface ChangeText {
  /** "+18%", "−3%", "+4 pts", or "No change". */
  text: string
  tone: "up" | "down" | "flat"
}

/** Relative change against the previous period. Up is green, down is muted (never red). `null` when there is nothing to compare. */
export function changeText(current: number | null, previous: number | null): ChangeText | null {
  if (current === null || previous === null || previous === 0) return null
  const value = (current - previous) / previous
  if (Math.abs(value) < 0.005) return { text: "No change", tone: "flat" }
  const pct = Math.abs(value * 100)
  const shown = pct < 10 ? pct.toFixed(1) : String(Math.round(pct))
  return value > 0 ? { text: `+${shown}%`, tone: "up" } : { text: `−${shown}%`, tone: "down" }
}

/** Change in percentage points, for rates such as read depth. */
export function pointsText(current: number | null, previous: number | null): ChangeText | null {
  if (current === null || previous === null) return null
  const diff = Math.round(current - previous)
  if (diff === 0) return { text: "No change", tone: "flat" }
  return diff > 0 ? { text: `+${diff} pts`, tone: "up" } : { text: `−${Math.abs(diff)} pts`, tone: "down" }
}

/** The design's six channels. Paid and referral visits are "Other". */
export const OVERVIEW_CHANNELS = ["Google", "AI answers", "Social", "Direct", "Email", "Other"] as const
export type OverviewChannel = (typeof OVERVIEW_CHANNELS)[number]

const CHANNEL_OF: Record<string, OverviewChannel> = {
  search: "Google",
  ai: "AI answers",
  social: "Social",
  direct: "Direct",
  email: "Email",
}

export interface ChannelRow {
  channel: OverviewChannel
  visitors: number
  /** Whole percent of all visits. */
  share: number
}

/** Blog visits by channel in the design's fixed order, empty channels dropped. */
export function groupChannels(rows: BreakdownValue[]): ChannelRow[] {
  const totals = new Map<OverviewChannel, number>()
  for (const row of rows) {
    const channel = CHANNEL_OF[row.value] ?? "Other"
    totals.set(channel, (totals.get(channel) ?? 0) + row.visitors)
  }
  const sum = [...totals.values()].reduce((s, v) => s + v, 0)
  return OVERVIEW_CHANNELS.map((channel) => ({ channel, visitors: totals.get(channel) ?? 0, share: sum ? Math.round(((totals.get(channel) ?? 0) / sum) * 100) : 0 }))
    .filter((row) => row.visitors > 0)
}

export interface CategoryRollup {
  name: string
  views: number
  posts: number
}

/** Views per category from the period's top posts, and how many published posts each category has. */
export function rollupCategories(rows: TopPostRow[], published: Array<{ category: string | null }>): CategoryRollup[] {
  const map = new Map<string, CategoryRollup>()
  const entry = (name: string) => {
    const cur = map.get(name) ?? { name, views: 0, posts: 0 }
    map.set(name, cur)
    return cur
  }
  for (const row of rows) entry(row.category_name ?? "No category").views += row.views
  for (const post of published) entry(post.category ?? "No category").posts += 1
  return [...map.values()].filter((c) => c.views > 0 || c.posts > 0).sort((a, b) => b.views - a.views || b.posts - a.posts)
}

export interface PublishDot {
  /** Index into the period's days. */
  index: number
  title: string
}

/** Publish dates inside the period, as indexes into the day series. Newest first, at most `limit`. */
export function publishDots(posts: Array<{ title: string; published_at: string | null }>, range: DateRange, limit = 4): PublishDot[] {
  const dots: Array<PublishDot & { at: string }> = []
  for (const post of posts) {
    if (!post.published_at) continue
    const day = post.published_at.slice(0, 10)
    if (day < range.from || day > range.to) continue
    const index = Math.round((Date.parse(`${day}T00:00:00Z`) - Date.parse(`${range.from}T00:00:00Z`)) / 86_400_000)
    dots.push({ index, title: post.title || "Untitled", at: post.published_at })
  }
  return dots
    .sort((a, b) => b.at.localeCompare(a.at))
    .slice(0, limit)
    .map(({ index, title }) => ({ index, title }))
    .sort((a, b) => a.index - b.index)
}

/** Day labels for the x axis: roughly one per week for a month, fewer for a long period. */
export function axisIndexes(length: number, target = 5): number[] {
  if (length <= 1) return [0]
  const step = Math.max(1, Math.round((length - 1) / (target - 1)))
  const out: number[] = []
  for (let i = 0; i < length; i += step) out.push(i)
  if (length - 1 - out[out.length - 1] >= step / 2) out.push(length - 1)
  return out
}

export { addDays }

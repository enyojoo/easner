/** What the dashboard reads. The production source is Supabase (supabase-source.ts); the dev harness swaps in sample data. */
import type { BlogStatsRow, Dimension, SiteStatsRow, VitalMetric } from "./types.ts"

export interface DateRange {
  from: string
  to: string
}

export interface PageRow {
  path: string
  views: number
  visitors: number
  avg_time_s: number | null
  bounces: number
  exits: number
  entries: number
  conversions: number
}
export interface BreakdownValue {
  value: string
  visitors: number
  views: number
}
export interface SearchQueryRow {
  query: string
  impressions: number
  clicks: number
  avg_position: number | null
}
export interface TopPostRow {
  post_id: string
  slug: string
  title: string
  category_name: string | null
  published_at: string | null
  views: number
  readers: number
  depth_25: number
  depth_100: number
  cta_clicks: number
  signups: number
  share_clicks: number
  share_visits: number
}
export interface FeedbackRow {
  post_id: string
  helpful: boolean
  reason: string | null
  votes: number
}
export interface VitalAgg {
  path: string
  metric: VitalMetric
  p75: number
  samples: number
}

export type AnalyticsStatus =
  | { state: "ready"; lastDay: string | null; gsc: boolean | null }
  | { state: "connect"; missing: string[] }
  | { state: "waiting" }

export interface AnalyticsSource {
  status(): Promise<AnalyticsStatus>
  /** One row per day for a scope path ('*' whole site, '/blog/*' the blog). */
  daily(path: string, range: DateRange): Promise<SiteStatsRow[]>
  pages(range: DateRange): Promise<PageRow[]>
  breakdown(range: DateRange, path: string, dimension: Dimension): Promise<BreakdownValue[]>
  search(range: DateRange, scope: "site" | "blog", postId?: string): Promise<SearchQueryRow[]>
  topPosts(range: DateRange, limit: number): Promise<TopPostRow[]>
  postDaily(postId: string, range: DateRange): Promise<BlogStatsRow[]>
  /** Helpful votes for one post, or every post. */
  feedback(postId?: string): Promise<FeedbackRow[]>
  vitals(range: DateRange): Promise<VitalAgg[]>
}

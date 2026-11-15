/** Shapes shared by the nightly job and the dashboard. No imports: this file is read by node's test runner too. */

/** `site_stats_daily` / `site_breakdown_daily` path conventions. */
export const SITE_PATH = "*"
export const BLOG_PATH = "/blog/*"

export type Dimension =
  | "country"
  | "region"
  | "city"
  | "device"
  | "browser"
  | "os"
  | "source"
  | "referrer"
  | "utm_campaign"
  | "share_click"
  | "share_visit"

export type Channel = "search" | "ai" | "social" | "email" | "paid" | "referral" | "direct"

export type VitalMetric = "LCP" | "INP" | "CLS" | "FCP"

export interface SiteStatsRow {
  date: string
  path: string
  visitors: number
  views: number
  avg_time_s: number | null
  bounces: number
  exits: number
  entries: number
  conversions: number
}

export interface BreakdownRow {
  date: string
  path: string
  dimension: Dimension
  value: string
  visitors: number
  views: number
}

export interface VitalsRow {
  date: string
  path: string
  metric: VitalMetric
  p75: number
  samples: number
}

export interface BlogStatsRow {
  post_id: string
  date: string
  views: number
  readers: number
  depth_25: number
  depth_50: number
  depth_75: number
  depth_100: number
  cta_clicks: number
  signups: number
  share_clicks: number
  share_visits: number
  avg_time_s: number | null
  sources: Record<string, number>
  shares: Record<string, number>
}

export interface SearchRow {
  date: string
  path: string
  query: string
  impressions: number
  clicks: number
  position: number | null
}

export interface BlogSearchRow {
  post_id: string
  date: string
  query: string
  impressions: number
  clicks: number
  position: number | null
}

/** Everything PostHog gives for one day, ready to upsert. Blog rows carry the slug until the store maps it to a post id. */
export interface PostHogDay {
  day: string
  siteStats: SiteStatsRow[]
  breakdowns: BreakdownRow[]
  vitals: VitalsRow[]
  blogStats: Array<Omit<BlogStatsRow, "post_id"> & { slug: string }>
}

export interface GscRow {
  path: string
  query: string
  impressions: number
  clicks: number
  position: number
}

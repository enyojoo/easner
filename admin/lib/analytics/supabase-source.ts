"use client"

/** The live analytics source: rollup tables and aggregate functions in Supabase, read as the signed-in member (RLS decides). */
import { supabase } from "@/lib/supabase"
import type { AnalyticsSource, AnalyticsStatus, BreakdownValue, DateRange, FeedbackRow, PageRow, SearchQueryRow, TopPostRow, VitalAgg } from "./source"
import type { BlogStatsRow, SiteStatsRow } from "./types"

const n = (value: unknown) => (value === null || value === undefined ? 0 : Number(value))
const nn = (value: unknown) => (value === null || value === undefined ? null : Number(value))

async function rpc<T>(name: string, args: Record<string, unknown>): Promise<T[]> {
  const { data, error } = await supabase.rpc(name, args)
  if (error) throw new Error(error.message)
  return (data ?? []) as T[]
}

async function fetchStatus(): Promise<AnalyticsStatus> {
  let connection: { posthog?: { connected: boolean; missing?: string[] }; gsc?: { connected: boolean } } | null = null
  try {
    const { data } = await supabase.auth.getSession()
    const token = data.session?.access_token
    if (token) {
      const response = await fetch("/api/analytics/status", { headers: { authorization: `Bearer ${token}` } })
      if (response.ok) connection = await response.json()
    }
  } catch {
    connection = null
  }
  if (connection?.posthog && !connection.posthog.connected) return { state: "connect", missing: connection.posthog.missing ?? [] }

  const { data, error } = await supabase.from("analytics_sync_log").select("day").eq("source", "posthog").eq("status", "ok").order("day", { ascending: false }).limit(1)
  if (error) throw new Error(error.message)
  const lastDay = (data?.[0] as { day: string } | undefined)?.day ?? null
  if (!lastDay) return connection ? { state: "waiting" } : { state: "connect", missing: [] }
  return { state: "ready", lastDay, gsc: connection?.gsc ? connection.gsc.connected : null }
}

export function createSupabaseSource(): AnalyticsSource {
  return {
    status: fetchStatus,
    async daily(path, range) {
      const { data, error } = await supabase
        .from("site_stats_daily")
        .select("date, path, visitors, views, avg_time_s, bounces, exits, entries, conversions")
        .eq("path", path)
        .gte("date", range.from)
        .lte("date", range.to)
        .order("date")
      if (error) throw new Error(error.message)
      return (data ?? []).map((r): SiteStatsRow => ({ date: r.date, path: r.path, visitors: n(r.visitors), views: n(r.views), avg_time_s: nn(r.avg_time_s), bounces: n(r.bounces), exits: n(r.exits), entries: n(r.entries), conversions: n(r.conversions) }))
    },
    async dailyBy(path, range, dimension, value) {
      const { data, error } = await supabase
        .from("site_breakdown_daily")
        .select("date, visitors, views")
        .eq("path", path)
        .eq("dimension", dimension)
        .eq("value", value)
        .gte("date", range.from)
        .lte("date", range.to)
        .order("date")
      if (error) throw new Error(error.message)
      return (data ?? []).map((r): SiteStatsRow => ({ date: r.date, path, visitors: n(r.visitors), views: n(r.views), avg_time_s: null, bounces: 0, exits: 0, entries: 0, conversions: 0 }))
    },
    async pages(range) {
      const rows = await rpc<Record<string, unknown>>("analytics_pages", { p_from: range.from, p_to: range.to })
      return rows.map((r): PageRow => ({ path: String(r.path), views: n(r.views), visitors: n(r.visitors), avg_time_s: nn(r.avg_time_s), bounces: n(r.bounces), exits: n(r.exits), entries: n(r.entries), conversions: n(r.conversions) }))
    },
    async breakdown(range, path, dimension) {
      const rows = await rpc<Record<string, unknown>>("analytics_breakdown", { p_from: range.from, p_to: range.to, p_path: path, p_dimension: dimension })
      return rows.map((r): BreakdownValue => ({ value: String(r.value), visitors: n(r.visitors), views: n(r.views) }))
    },
    async search(range, scope, postId) {
      const rows = await rpc<Record<string, unknown>>("analytics_search", { p_from: range.from, p_to: range.to, p_scope: scope, p_post: postId ?? null })
      return rows.map((r): SearchQueryRow => ({ query: String(r.query), impressions: n(r.impressions), clicks: n(r.clicks), avg_position: nn(r.avg_position) }))
    },
    async topPosts(range, limit) {
      const rows = await rpc<Record<string, unknown>>("analytics_top_posts", { p_from: range.from, p_to: range.to, p_limit: limit })
      return rows.map((r): TopPostRow => ({
        post_id: String(r.post_id), slug: String(r.slug), title: String(r.title ?? ""), category_name: (r.category_name as string | null) ?? null, published_at: (r.published_at as string | null) ?? null,
        views: n(r.views), readers: n(r.readers), depth_25: n(r.depth_25), depth_50: n(r.depth_50), depth_75: n(r.depth_75), depth_100: n(r.depth_100), cta_clicks: n(r.cta_clicks), signups: n(r.signups), share_clicks: n(r.share_clicks), share_visits: n(r.share_visits),
      }))
    },
    async postDaily(postId: string, range: DateRange) {
      const { data, error } = await supabase.from("blog_stats_daily").select("*").eq("post_id", postId).gte("date", range.from).lte("date", range.to).order("date")
      if (error) throw new Error(error.message)
      return (data ?? []).map((r): BlogStatsRow => ({
        post_id: r.post_id, date: r.date, views: n(r.views), readers: n(r.readers), depth_25: n(r.depth_25), depth_50: n(r.depth_50), depth_75: n(r.depth_75), depth_100: n(r.depth_100),
        cta_clicks: n(r.cta_clicks), signups: n(r.signups), share_clicks: n(r.share_clicks), share_visits: n(r.share_visits), avg_time_s: nn(r.avg_time_s),
        sources: (r.sources ?? {}) as Record<string, number>, shares: (r.shares ?? {}) as Record<string, number>,
      }))
    },
    async feedback(postId) {
      const rows = await rpc<Record<string, unknown>>("analytics_feedback", { p_post: postId ?? null })
      return rows.map((r): FeedbackRow => ({ post_id: String(r.post_id), helpful: Boolean(r.helpful), reason: (r.reason as string | null) ?? null, votes: n(r.votes) }))
    },
    async vitals(range) {
      const rows = await rpc<Record<string, unknown>>("analytics_vitals", { p_from: range.from, p_to: range.to })
      return rows.map((r): VitalAgg => ({ path: String(r.path), metric: r.metric as VitalAgg["metric"], p75: n(r.p75), samples: n(r.samples) }))
    },
  }
}

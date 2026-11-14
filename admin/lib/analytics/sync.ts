/**
 * The nightly rollup: which days are missing, fetch them from PostHog and Search Console, upsert the rollup tables.
 * Everything with side effects is injected (`store`, `posthog`, `gsc`), so this runs against fakes in sync.test.ts.
 */
import { GSC_LAG_DAYS, type GscFetcher } from "./gsc.ts"
import { addDays } from "./paths.ts"
import { fetchPostHogDay, type HogQLRunner } from "./posthog.ts"
import type { AnalyticsEnv } from "./env.ts"
import type { GscRow, PostHogDay } from "./types.ts"

export type Source = "posthog" | "gsc"

export interface AnalyticsStore {
  /** blog_posts.slug → id. */
  postIdsBySlug(): Promise<Map<string, string>>
  /** Days already written with status ok. */
  syncedDays(source: Source): Promise<Set<string>>
  upsert(table: string, rows: object[], onConflict: string): Promise<void>
  record(entry: { source: Source; day: string; status: "ok" | "error" | "skipped"; rows: number; error?: string }): Promise<void>
  /** Delete rollup rows older than `day` (retention). */
  prune(day: string): Promise<void>
}

export interface SyncOptions {
  /** Today in UTC (yyyy-mm-dd). */
  today: string
  /** Days to look back when the log has entries. */
  window?: number
  /** Days to look back on the very first run, or when `days` is passed to the route. */
  backfill?: number
  /** Most days fetched per source in one run (keeps a run inside the function's time limit). */
  maxPerRun?: number
}

export interface DayResult {
  day: string
  status: "ok" | "error"
  rows: number
  error?: string
}
export type SourceResult = { state: "skipped"; reason: string } | { state: "ran"; days: DayResult[] }
export interface SyncResult {
  posthog: SourceResult
  gsc: SourceResult
}

export const RETENTION_DAYS = 760 // about 25 months

export function missingDays(newest: string, lookback: number, done: Set<string>): string[] {
  const days: string[] = []
  for (let i = lookback - 1; i >= 0; i--) {
    const day = addDays(newest, -i)
    if (!done.has(day)) days.push(day)
  }
  return days // oldest first
}

const message = (error: unknown) => (error instanceof Error ? error.message : String(error)).slice(0, 300)

export function postHogRows(day: PostHogDay, ids: Map<string, string>) {
  const blog = day.blogStats.flatMap(({ slug, ...row }) => {
    const post_id = ids.get(slug)
    return post_id ? [{ post_id, ...row }] : []
  })
  return { site_stats_daily: day.siteStats, site_breakdown_daily: day.breakdowns, site_vitals_daily: day.vitals, blog_stats_daily: blog }
}

const KEYS: Record<string, string> = {
  site_stats_daily: "date,path",
  site_breakdown_daily: "date,path,dimension,value",
  site_vitals_daily: "date,path,metric",
  blog_stats_daily: "post_id,date",
  site_search_daily: "date,path,query",
  blog_search_daily: "post_id,date,query",
}

export function gscRows(day: string, rows: GscRow[], ids: Map<string, string>) {
  const sorted = [...rows].sort((a, b) => b.impressions - a.impressions)
  const site = sorted.slice(0, 2000).map((r) => ({ date: day, path: r.path, query: r.query, impressions: r.impressions, clicks: r.clicks, position: r.position }))
  const blog = sorted.flatMap((r) => {
    const match = /^\/blog\/([^/]+)$/.exec(r.path)
    const post_id = match ? ids.get(decodeURIComponent(match[1])) : undefined
    return post_id ? [{ post_id, date: day, query: r.query, impressions: r.impressions, clicks: r.clicks, position: r.position }] : []
  })
  return { site_search_daily: site, blog_search_daily: blog }
}

async function writeAll(store: AnalyticsStore, tables: Record<string, object[]>): Promise<number> {
  let total = 0
  for (const [table, rows] of Object.entries(tables)) {
    if (!rows.length) continue
    await store.upsert(table, rows, KEYS[table])
    total += rows.length
  }
  return total
}

export async function runSync(
  deps: { env: AnalyticsEnv; store: AnalyticsStore | null; posthog: HogQLRunner | null; gsc: GscFetcher | null },
  options: SyncOptions,
): Promise<SyncResult> {
  const { store, posthog, gsc, env } = deps
  const window = options.window ?? 3
  const backfill = options.backfill ?? 7
  const maxPerRun = options.maxPerRun ?? 7

  const reason = (c: { ok: false; missing: string[] } | { ok: true }, what: string) => (c.ok ? null : `${what} isn’t connected: ${c.missing.join(", ")} not set.`)
  if (!store || !env.supabase.ok) {
    const why = reason(env.supabase, "Supabase") ?? "No store."
    return { posthog: { state: "skipped", reason: why }, gsc: { state: "skipped", reason: why } }
  }

  const ids = await store.postIdsBySlug()

  const sourceRun = async (
    source: Source,
    runner: unknown,
    skipReason: string | null,
    newest: string,
    fetchDay: (day: string) => Promise<number>,
  ): Promise<SourceResult> => {
    if (!runner || skipReason) return { state: "skipped", reason: skipReason ?? "Not connected." }
    const done = await store.syncedDays(source)
    const lookback = done.size === 0 ? backfill : window
    const days = missingDays(newest, lookback, done).slice(-maxPerRun)
    const results: DayResult[] = []
    for (const day of days) {
      try {
        const rows = await fetchDay(day)
        await store.record({ source, day, status: "ok", rows })
        results.push({ day, status: "ok", rows })
      } catch (error) {
        const text = message(error)
        await store.record({ source, day, status: "error", rows: 0, error: text }).catch(() => undefined)
        results.push({ day, status: "error", rows: 0, error: text })
      }
    }
    return { state: "ran", days: results }
  }

  const [phResult, gscResult] = await Promise.all([
    sourceRun("posthog", posthog, reason(env.posthog, "PostHog"), addDays(options.today, -1), async (day) => {
      const data = await fetchPostHogDay(posthog!, day)
      return writeAll(store, postHogRows(data, ids))
    }),
    sourceRun("gsc", gsc, reason(env.gsc, "Search Console"), addDays(options.today, -GSC_LAG_DAYS), async (day) => {
      const rows = await gsc!(day)
      return writeAll(store, gscRows(day, rows, ids))
    }),
  ])

  if (phResult.state === "ran" || gscResult.state === "ran") await store.prune(addDays(options.today, -RETENTION_DAYS))
  return { posthog: phResult, gsc: gscResult }
}

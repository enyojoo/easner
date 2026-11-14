import "server-only"

/** The rollup store on Supabase, written with the secret (service role) key. Server only; the key never reaches the browser. */
import { createClient } from "@supabase/supabase-js"
import type { AnalyticsStore, Source } from "@/lib/analytics/sync"

const CHUNK = 500
const ROLLUP_TABLES: Array<[string, string]> = [
  ["site_stats_daily", "date"],
  ["site_breakdown_daily", "date"],
  ["site_vitals_daily", "date"],
  ["site_search_daily", "date"],
  ["blog_stats_daily", "date"],
  ["blog_search_daily", "date"],
  ["analytics_sync_log", "day"],
]

export function createSupabaseStore(url: string, secretKey: string): AnalyticsStore {
  const client = createClient(url, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { "X-Client-Info": "easner-admin-rollup" } },
  })
  const fail = (what: string, error: { message: string } | null) => {
    if (error) throw new Error(`${what}: ${error.message}`)
  }

  return {
    async postIdsBySlug() {
      const { data, error } = await client.from("blog_posts").select("id, slug")
      fail("read posts", error)
      return new Map((data ?? []).map((row: { id: string; slug: string }) => [row.slug, row.id]))
    },
    async syncedDays(source: Source) {
      const { data, error } = await client.from("analytics_sync_log").select("day").eq("source", source).eq("status", "ok")
      fail("read sync log", error)
      return new Set((data ?? []).map((row: { day: string }) => row.day))
    },
    async upsert(table, rows, onConflict) {
      for (let i = 0; i < rows.length; i += CHUNK) {
        const { error } = await client.from(table).upsert(rows.slice(i, i + CHUNK), { onConflict })
        fail(`write ${table}`, error)
      }
    },
    async record(entry) {
      const { error } = await client.from("analytics_sync_log").upsert(
        { source: entry.source, day: entry.day, status: entry.status, rows_written: entry.rows, error: entry.error ?? null, finished_at: new Date().toISOString() },
        { onConflict: "source,day" },
      )
      fail("write sync log", error)
    },
    async prune(day) {
      for (const [table, column] of ROLLUP_TABLES) {
        const { error } = await client.from(table).delete().lt(column, day)
        fail(`prune ${table}`, error)
      }
    },
  }
}

import { test } from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { analyticsEnv } from "./env.ts"
import { gscRows, missingDays, runSync, type AnalyticsStore, type Source } from "./sync.ts"

const fixture = JSON.parse(readFileSync(new URL("./fixtures/posthog-day.json", import.meta.url), "utf8")) as Record<string, unknown[][]>

function fakeStore(done: Partial<Record<Source, string[]>> = {}) {
  const writes: Array<{ table: string; rows: object[]; onConflict: string }> = []
  const log: Array<{ source: Source; day: string; status: string; rows: number }> = []
  let pruned: string | null = null
  const store: AnalyticsStore = {
    async postIdsBySlug() { return new Map([["send-money-to-nigeria", "post-1"]]) },
    async syncedDays(source) { return new Set(done[source] ?? []) },
    async upsert(table, rows, onConflict) { writes.push({ table, rows, onConflict }) },
    async record(entry) { log.push(entry) },
    async prune(day) { pruned = day },
  }
  return { store, writes, log, pruned: () => pruned }
}
const fullEnv = analyticsEnv({
  POSTHOG_PROJECT_ID: "1", POSTHOG_PERSONAL_API_KEY: "k", GSC_SITE_URL: "sc-domain:easner.com", GSC_SERVICE_ACCOUNT_JSON: "{}",
  NEXT_PUBLIC_SUPABASE_URL: "https://x.supabase.co", SUPABASE_SECRET_KEY: "s", CRON_SECRET: "c",
})
const runner = async (name: string) => ({ results: fixture[name] ?? [] })

test("analyticsEnv names what is missing and defaults the PostHog host", () => {
  const env = analyticsEnv({ POSTHOG_PROJECT_ID: "1", SUPABASE_SECRET_KEY: " " })
  assert.deepEqual(env.posthog, { ok: false, missing: ["POSTHOG_PERSONAL_API_KEY"] })
  assert.deepEqual(env.gsc.ok === false && env.gsc.missing, ["GSC_SITE_URL", "GSC_SERVICE_ACCOUNT_JSON"])
  assert.equal(env.cronSecret, null)
  assert.equal(fullEnv.posthog.ok && fullEnv.posthog.host, "https://us.posthog.com")
  assert.equal(analyticsEnv({ POSTHOG_PROJECT_ID: "1", POSTHOG_PERSONAL_API_KEY: "k", POSTHOG_HOST: "https://eu.posthog.com/" }).posthog.ok && true, true)
})

test("missingDays lists the gaps, oldest first", () => {
  assert.deepEqual(missingDays("2026-11-14", 3, new Set(["2026-11-13"])), ["2026-11-12", "2026-11-14"])
  assert.deepEqual(missingDays("2026-11-14", 2, new Set(["2026-11-14", "2026-11-13"])), [])
})

test("with no keys and no database it does nothing", async () => {
  const result = await runSync({ env: analyticsEnv({}), store: null, posthog: null, gsc: null }, { today: "2026-11-15" })
  assert.equal(result.posthog.state, "skipped")
  assert.equal(result.gsc.state, "skipped")
})

test("with the database but no keys it skips both sources and writes nothing", async () => {
  const { store, writes, log } = fakeStore()
  const env = analyticsEnv({ NEXT_PUBLIC_SUPABASE_URL: "https://x.supabase.co", SUPABASE_SECRET_KEY: "s" })
  const result = await runSync({ env, store, posthog: null, gsc: null }, { today: "2026-11-15" })
  assert.deepEqual(result.posthog, { state: "skipped", reason: "PostHog isn’t connected: POSTHOG_PROJECT_ID, POSTHOG_PERSONAL_API_KEY not set." })
  assert.equal(result.gsc.state, "skipped")
  assert.equal(writes.length + log.length, 0)
})

test("first run backfills a week from PostHog and writes every table", async () => {
  const { store, writes, log, pruned } = fakeStore()
  const result = await runSync({ env: fullEnv, store, posthog: runner, gsc: null }, { today: "2026-11-15" })
  assert.equal(result.posthog.state === "ran" && result.posthog.days.length, 7)
  assert.equal(result.gsc.state, "skipped")
  assert.deepEqual(log.slice(0, 1).map((l) => [l.source, l.day, l.status]), [["posthog", "2026-11-08", "ok"]])
  const tables = new Set(writes.map((w) => w.table))
  for (const t of ["site_stats_daily", "site_breakdown_daily", "site_vitals_daily", "blog_stats_daily"]) assert.ok(tables.has(t), t)
  const blog = writes.find((w) => w.table === "blog_stats_daily")!
  assert.equal((blog.rows[0] as { post_id: string }).post_id, "post-1")
  assert.equal(blog.onConflict, "post_id,date")
  assert.equal(pruned(), "2024-10-16")
})

test("later runs only fetch the last three days that are missing", async () => {
  const { store, log } = fakeStore({ posthog: ["2026-11-14", "2026-11-12"] })
  const result = await runSync({ env: fullEnv, store, posthog: runner, gsc: null }, { today: "2026-11-15" })
  assert.deepEqual(result.posthog.state === "ran" && result.posthog.days.map((d) => d.day), ["2026-11-13"])
  assert.equal(log.length, 1)
})

test("a failing day is logged as an error, the others still run", async () => {
  const { store, log } = fakeStore({ posthog: ["2026-11-12"] })
  let first = true
  const flaky = async (name: string) => {
    if (name === "pages" && first) { first = false; throw new Error("PostHog 500 on pages") }
    return { results: fixture[name] ?? [] }
  }
  const result = await runSync({ env: fullEnv, store, posthog: flaky, gsc: null }, { today: "2026-11-15" })
  const days = result.posthog.state === "ran" ? result.posthog.days : []
  assert.deepEqual(days.map((d) => d.status).sort(), ["error", "ok"])
  assert.ok(log.some((l) => l.status === "error"))
})

test("search console rows land in the site and blog tables, three days behind", async () => {
  const { store, writes } = fakeStore({ gsc: ["2026-11-10"] })
  const gsc = async () => [
    { path: "/blog/send-money-to-nigeria", query: "send money", impressions: 40, clicks: 3, position: 4 },
    { path: "/pricing", query: "easner pricing", impressions: 10, clicks: 1, position: 2 },
  ]
  const result = await runSync({ env: fullEnv, store, posthog: null, gsc }, { today: "2026-11-15" })
  assert.deepEqual(result.gsc.state === "ran" && result.gsc.days.map((d) => d.day), ["2026-11-11", "2026-11-12"])
  assert.equal(writes.filter((w) => w.table === "site_search_daily").length, 2)
  assert.equal(writes.find((w) => w.table === "blog_search_daily")!.rows.length, 1)
})

test("gscRows maps only known posts and caps the site rows", () => {
  const rows = Array.from({ length: 2500 }, (_, i) => ({ path: "/x", query: `q${i}`, impressions: i, clicks: 0, position: 1 }))
  const out = gscRows("2026-11-12", rows, new Map())
  assert.equal(out.site_search_daily.length, 2000)
  assert.equal(out.blog_search_daily.length, 0)
  assert.equal((out.site_search_daily[0] as { query: string }).query, "q2499")
})

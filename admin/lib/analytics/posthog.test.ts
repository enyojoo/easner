import { test } from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { buildPostHogDay, createHogQLRunner, fetchPostHogDay, hogqlQueries } from "./posthog.ts"

const fixture = JSON.parse(readFileSync(new URL("./fixtures/posthog-day.json", import.meta.url), "utf8")) as Record<string, unknown[][]>
const DAY = "2026-11-14"

test("every query is bounded and pinned to the day", () => {
  const queries = hogqlQueries(DAY)
  assert.ok(queries.length >= 30)
  assert.equal(new Set(queries.map((q) => q.name)).size, queries.length)
  for (const q of queries) {
    assert.ok(q.query.includes(`toDate('${DAY}')`), q.name)
    if (q.name !== "totals_site" && q.name !== "totals_blog" && q.name !== "vitals_site") assert.match(q.query, /limit \d+/, q.name)
  }
})

test("site stats: totals, pages and sessions", () => {
  const day = buildPostHogDay(DAY, fixture)
  const row = (path: string) => day.siteStats.find((r) => r.path === path)!
  assert.deepEqual([row("*").visitors, row("*").views, row("*").entries, row("*").bounces, row("*").exits], [170, 250, 60, 20, 60])
  assert.equal(row("*").conversions, 12 + 5 + 3)
  assert.equal(row("/blog/*").views, 90)
  assert.equal(row("/blog/*").entries, 30)
  assert.equal(row("/pricing").views, 40, "trailing slashes are normalised")
  assert.equal(row("/pricing").avg_time_s, 40)
  assert.equal(row("/pricing").exits, 30)
  assert.equal(row("/pricing").conversions, 5)
  assert.equal(row("/blog").views, 30)
  assert.equal(row("/").avg_time_s, 20)
  assert.equal(row("*").avg_time_s, Math.round(((20 * 100 + 120 * 50 + 40 * 30) / 180) * 10) / 10)
})

test("breakdowns: countries by scope, channels and referrers", () => {
  const day = buildPostHogDay(DAY, fixture)
  const find = (path: string, dimension: string, value: string) => day.breakdowns.find((b) => b.path === path && b.dimension === dimension && b.value === value)
  assert.equal(find("*", "country", "NG")?.visitors, 80)
  assert.equal(find("/blog/*", "country", "GB")?.visitors, 30)
  assert.equal(find("/blog/send-money-to-nigeria", "country", "NG")?.visitors, 30)
  assert.equal(find("/blog", "country", "NG"), undefined, "the blog index is not a post")
  assert.equal(find("*", "city", "Lagos, NG")?.visitors, 40)
  assert.equal(find("*", "source", "search")?.visitors, 50)
  assert.equal(find("*", "source", "ai")?.visitors, 10)
  assert.equal(find("*", "source", "direct")?.visitors, 60)
  assert.equal(find("*", "source", "social")?.visitors, 4)
  assert.equal(find("*", "referrer", "google.com")?.visitors, 50)
  assert.equal(find("*", "referrer", "direct")?.visitors, 60)
})

test("shares: clicks by network and the visits they brought back", () => {
  const day = buildPostHogDay(DAY, fixture)
  const find = (path: string, dimension: string, value: string) => day.breakdowns.find((b) => b.path === path && b.dimension === dimension && b.value === value)
  assert.equal(find("*", "share_click", "x")?.views, 6)
  assert.equal(find("/blog/send-money-to-nigeria", "share_click", "linkedin")?.views, 2)
  assert.equal(find("/blog/send-money-to-nigeria", "share_visit", "x")?.views, 5)
  assert.equal(find("*", "share_visit", "x")?.visitors, 4)
  const post = day.blogStats.find((s) => s.slug === "send-money-to-nigeria")!
  assert.equal(post.share_clicks, 8)
  assert.equal(post.share_visits, 5)
  assert.deepEqual(post.shares, { x: 6, linkedin: 2 })
})

test("per-post stats: views, depth, ctas, sign-ups, sources", () => {
  const day = buildPostHogDay(DAY, fixture)
  assert.equal(day.blogStats.length, 1, "only single posts become blog stats")
  const post = day.blogStats[0]
  assert.equal(post.views, 60)
  assert.equal(post.readers, 48)
  assert.deepEqual([post.depth_25, post.depth_50, post.depth_75, post.depth_100], [40, 30, 20, 10])
  assert.equal(post.cta_clicks, 7)
  assert.equal(post.signups, 3)
  assert.equal(post.avg_time_s, 120)
  assert.deepEqual(post.sources, { search: 25, social: 4 })
})

test("web vitals: site and page rows, empty metrics skipped", () => {
  const day = buildPostHogDay(DAY, fixture)
  assert.equal(day.vitals.length, 8)
  assert.deepEqual(day.vitals.find((v) => v.path === "*" && v.metric === "LCP"), { date: DAY, path: "*", metric: "LCP", p75: 2100, samples: 80 })
  const empty = buildPostHogDay(DAY, { vitals_site: [[null, 0, null, 0, null, 0, null, 0]] })
  assert.equal(empty.vitals.length, 0)
})

test("an empty day still yields the two total rows", () => {
  const day = buildPostHogDay(DAY, {})
  assert.deepEqual(day.siteStats.map((r) => [r.path, r.views]), [["*", 0], ["/blog/*", 0]])
})

test("fetchPostHogDay runs every query and parses", async () => {
  const seen: string[] = []
  const day = await fetchPostHogDay(async (name) => {
    seen.push(name)
    return { results: fixture[name] ?? [] }
  }, DAY)
  assert.equal(seen.length, hogqlQueries(DAY).length)
  assert.equal(day.siteStats[0].visitors, 170)
})

test("fetchPostHogDay fails the day when one query fails", async () => {
  await assert.rejects(fetchPostHogDay(async (name) => { if (name === "pages") throw new Error("boom"); return { results: [] } }, DAY), /boom/)
})

test("createHogQLRunner posts to the project's query endpoint with the key", async () => {
  let call: { url: string; init: RequestInit } | null = null
  const run = createHogQLRunner(
    { host: "https://eu.posthog.com", projectId: "123", apiKey: "phx_test" },
    (async (url: string, init: RequestInit) => {
      call = { url, init }
      return new Response(JSON.stringify({ columns: ["a"], results: [[1]] }), { status: 200 })
    }) as unknown as typeof fetch,
  )
  const result = await run("pages", "select 1")
  assert.deepEqual(result.results, [[1]])
  assert.equal(call!.url, "https://eu.posthog.com/api/projects/123/query/")
  assert.equal((call!.init.headers as Record<string, string>).authorization, "Bearer phx_test")
  assert.equal(JSON.parse(call!.init.body as string).query.kind, "HogQLQuery")
  const bad = createHogQLRunner({ host: "https://x", projectId: "1", apiKey: "k" }, (async () => new Response("no", { status: 401 })) as unknown as typeof fetch)
  await assert.rejects(bad("pages", "q"), /401/)
})

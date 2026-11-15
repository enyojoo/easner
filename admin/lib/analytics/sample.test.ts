import { test } from "node:test"
import assert from "node:assert/strict"
import { generateSampleData, createSampleSource, SAMPLE_POSTS } from "./sample.ts"
import { groupSmall, rangeForPeriod, sumDaily } from "./aggregate.ts"

test("sample data is deterministic for a seed and day", () => {
  const a = generateSampleData("2026-11-15")
  const b = generateSampleData("2026-11-15")
  assert.deepEqual(a.site.slice(0, 50), b.site.slice(0, 50))
  assert.notDeepEqual(a.site.slice(0, 20), generateSampleData("2026-11-15", 7).site.slice(0, 20))
})

test("sample source answers like the SQL functions", async () => {
  const source = createSampleSource("2026-11-15")
  const range = rangeForPeriod("30d", "2026-11-15")
  const daily = await source.daily("*", range)
  assert.equal(daily.length, 30)
  assert.ok(sumDaily(daily).visitors > 1000)
  const cities = groupSmall(await source.breakdown(range, "*", "city"))
  assert.equal(cities[cities.length - 1].value, "Other", "small cities are grouped")
  assert.ok(cities.slice(0, -1).every((c) => c.visitors >= 5))
  const top = await source.topPosts(range, 10)
  assert.ok(top.length > 0 && top.length <= SAMPLE_POSTS.length)
  assert.ok(top[0].views >= top[top.length - 1].views)
  assert.ok((await source.search(range, "blog")).length > 0)
})

test("dailyBy gives one dimension value per day, visitors and views only", async () => {
  const source = createSampleSource("2026-11-15")
  const range = rangeForPeriod("30d", "2026-11-15")
  const rows = await source.dailyBy("*", range, "country", "NG")
  assert.ok(rows.length > 0 && rows.length <= 30)
  assert.ok(rows.every((r) => r.path === "*" && r.avg_time_s === null && r.conversions === 0 && r.visitors > 0))
  const all = sumDaily(await source.daily("*", range))
  assert.ok(sumDaily(rows).visitors < all.visitors, "one country is a part of the whole")
  assert.deepEqual(await source.dailyBy("*", range, "country", "ZZ"), [])
})

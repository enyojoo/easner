import { test } from "node:test"
import assert from "node:assert/strict"
import { change, fillDays, formatDuration, groupSmall, parseRange, previousRange, rangeForPeriod, readDepthPercent, sumDaily, topWithOther, vitalStatus } from "./aggregate.ts"

test("ranges end yesterday and the previous one abuts them", () => {
  assert.deepEqual(rangeForPeriod("7d", "2026-11-15"), { from: "2026-11-08", to: "2026-11-14" })
  assert.deepEqual(previousRange({ from: "2026-11-08", to: "2026-11-14" }), { from: "2026-11-01", to: "2026-11-07" })
  assert.equal(rangeForPeriod("12m", "2026-11-15").from, "2025-11-15")
})

test("parseRange: periods, custom ranges and bad input", () => {
  assert.deepEqual(parseRange({ period: "90d" }, "2026-11-15").period, "90d")
  assert.equal(parseRange({ period: "nope" }, "2026-11-15").period, "30d")
  const custom = parseRange({ from: "2026-11-10", to: "2026-11-01" }, "2026-11-15")
  assert.deepEqual(custom, { period: "custom", range: { from: "2026-11-01", to: "2026-11-10" } })
  assert.equal(parseRange({ from: "2026-11-01", to: "2030-01-01" }, "2026-11-15").range.to, "2026-11-14")
  assert.equal(parseRange({ from: "bad", to: "2026-11-01" }, "2026-11-15").period, "30d")
  assert.ok(parseRange({ from: "2000-01-01", to: "2026-11-01" }, "2026-11-15").range.from > "2024-01-01")
})

test("cities under five visitors become Other", () => {
  const rows = [
    { value: "Lagos, NG", visitors: 40, views: 60 },
    { value: "Accra, GH", visitors: 5, views: 6 },
    { value: "Kano, NG", visitors: 4, views: 4 },
    { value: "Enugu, NG", visitors: 1, views: 2 },
  ]
  assert.deepEqual(groupSmall(rows), [
    { value: "Lagos, NG", visitors: 40, views: 60 },
    { value: "Accra, GH", visitors: 5, views: 6 },
    { value: "Other", visitors: 5, views: 6 },
  ])
  assert.deepEqual(groupSmall([{ value: "Kano, NG", visitors: 4, views: 4 }]), [{ value: "Other", visitors: 4, views: 4 }])
  assert.deepEqual(groupSmall([{ value: "Lagos, NG", visitors: 9, views: 9 }]).map((r) => r.value), ["Lagos, NG"])
  assert.deepEqual(groupSmall([{ value: "Other", visitors: 2, views: 2 }, { value: "Kano, NG", visitors: 4, views: 4 }]), [{ value: "Other", visitors: 6, views: 6 }])
})

test("topWithOther rolls up the tail", () => {
  const rows = [10, 8, 6, 4].map((v, i) => ({ value: `v${i}`, visitors: v, views: v }))
  assert.deepEqual(topWithOther(rows, 2).map((r) => [r.value, r.visitors]), [["v0", 10], ["v1", 8], ["Other", 10]])
  assert.equal(topWithOther(rows, 9).length, 4)
})

test("totals, deltas and depth", () => {
  const t = sumDaily([
    { date: "a", path: "*", visitors: 10, views: 20, avg_time_s: 30, bounces: 2, exits: 0, entries: 5, conversions: 1 },
    { date: "b", path: "*", visitors: 10, views: 20, avg_time_s: 60, bounces: 0, exits: 0, entries: 5, conversions: 2 },
  ])
  assert.deepEqual([t.visitors, t.views, t.avgTimeS, t.bounceRate, t.conversions, t.viewsPerVisit], [20, 40, 45, 0.2, 3, 2])
  assert.equal(sumDaily([]).bounceRate, null)
  assert.equal(change(120, 100), 0.2)
  assert.equal(change(5, 0), null)
  assert.equal(readDepthPercent(10, 10, 10, 10, 10), 100)
  assert.equal(readDepthPercent(10, 0, 0, 0, 10), 25)
  assert.equal(readDepthPercent(0, 0, 0, 0, 0), null)
})

test("vitals and formatting", () => {
  assert.equal(vitalStatus("LCP", 2400), "good")
  assert.equal(vitalStatus("INP", 300), "needs improvement")
  assert.equal(vitalStatus("CLS", 0.4), "poor")
  assert.equal(formatDuration(95), "1m 35s")
  assert.equal(formatDuration(null), "n/a")
  assert.deepEqual(fillDays([{ date: "2026-11-02", visitors: 1, views: 2 }], { from: "2026-11-01", to: "2026-11-03" }).map((r) => r.views), [0, 2, 0])
})

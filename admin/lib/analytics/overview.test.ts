import assert from "node:assert/strict"
import test from "node:test"
import { axisIndexes, changeText, groupChannels, pointsText, publishDots, rollupCategories } from "./overview.ts"
import type { TopPostRow } from "./source.ts"

test("changeText: up, down, flat and no baseline", () => {
  assert.deepEqual(changeText(118, 100), { text: "+18%", tone: "up" })
  assert.deepEqual(changeText(97, 100), { text: "−3.0%", tone: "down" })
  assert.deepEqual(changeText(100, 100), { text: "No change", tone: "flat" })
  assert.equal(changeText(5, 0), null)
  assert.equal(changeText(null, 3), null)
})

test("changeText never uses a dash or a minus hyphen", () => {
  assert.ok(!changeText(50, 100)!.text.includes("-"))
})

test("pointsText: whole points", () => {
  assert.deepEqual(pointsText(63, 59), { text: "+4 pts", tone: "up" })
  assert.deepEqual(pointsText(50, 54), { text: "−4 pts", tone: "down" })
  assert.deepEqual(pointsText(50, 50.2), { text: "No change", tone: "flat" })
})

test("groupChannels: AI answers grouped, paid and referral are Other, fixed order", () => {
  const rows = groupChannels([
    { value: "search", visitors: 40, views: 0 },
    { value: "ai", visitors: 10, views: 0 },
    { value: "paid", visitors: 2, views: 0 },
    { value: "referral", visitors: 8, views: 0 },
    { value: "direct", visitors: 40, views: 0 },
  ])
  assert.deepEqual(rows.map((r) => r.channel), ["Google", "AI answers", "Direct", "Other"])
  assert.equal(rows[0].share, 40)
  assert.equal(rows.find((r) => r.channel === "Other")!.visitors, 10)
})

test("rollupCategories: views from top posts, posts from the published list", () => {
  const top = [
    { category_name: "Business", views: 30 },
    { category_name: "Business", views: 20 },
    { category_name: null, views: 5 },
  ] as TopPostRow[]
  const out = rollupCategories(top, [{ category: "Business" }, { category: "Business" }, { category: "Company" }])
  assert.deepEqual(out, [
    { name: "Business", views: 50, posts: 2 },
    { name: "No category", views: 5, posts: 0 },
    { name: "Company", views: 0, posts: 1 },
  ])
})

test("publishDots: only dates inside the period, as day indexes", () => {
  const range = { from: "2026-10-16", to: "2026-11-14" }
  const dots = publishDots(
    [
      { title: "In", published_at: "2026-11-04T09:00:00Z" },
      { title: "Before", published_at: "2026-10-01T09:00:00Z" },
      { title: "Draft", published_at: null },
    ],
    range,
  )
  assert.deepEqual(dots, [{ index: 19, title: "In" }])
})

test("axisIndexes: starts at the first day, about one label a week for a month", () => {
  const a = axisIndexes(30)
  assert.deepEqual(a, [0, 7, 14, 21, 28])
  assert.deepEqual(axisIndexes(7).at(-1), 6)
  assert.deepEqual(axisIndexes(1), [0])
})

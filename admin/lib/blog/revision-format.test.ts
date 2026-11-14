import { test } from "node:test"
import assert from "node:assert/strict"
import { isMilestone, wordDelta, whenLabel } from "./revision-format.ts"

test("wordDelta", () => {
  assert.equal(wordDelta(120, 100), "+20 words")
  assert.equal(wordDelta(99, 100), "−1 word")
  assert.equal(wordDelta(100, 100), "No word change")
  assert.equal(wordDelta(5, null), "5 words")
  assert.equal(wordDelta(null, 3), "")
})

test("milestones are everything but autosaves", () => {
  assert.equal(isMilestone("autosave"), false)
  for (const kind of ["submit", "publish", "restore"] as const) assert.equal(isMilestone(kind), true)
})

test("whenLabel", () => {
  const now = new Date(2026, 10, 18, 15, 0)
  assert.equal(whenLabel(new Date(2026, 10, 18, 9, 5).toISOString(), now), "Today, 09:05")
  assert.equal(whenLabel(new Date(2026, 10, 17, 23, 59).toISOString(), now), "Yesterday, 23:59")
  assert.equal(whenLabel(new Date(2026, 9, 3, 8, 30).toISOString(), now), "3 Oct, 08:30")
  assert.equal(whenLabel(new Date(2025, 11, 25, 8, 30).toISOString(), now), "25 Dec 2025")
})

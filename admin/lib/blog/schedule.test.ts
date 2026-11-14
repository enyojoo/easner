import { test } from "node:test"
import assert from "node:assert/strict"
import { formatInZone, utcToZoned, validateSchedule, zonedToUtc } from "./schedule.ts"

test("zonedToUtc: wall clock in a zone to the UTC instant", () => {
  assert.equal(zonedToUtc("2026-12-01T09:30", "UTC")?.toISOString(), "2026-12-01T09:30:00.000Z")
  assert.equal(zonedToUtc("2026-12-01T09:30", "Africa/Lagos")?.toISOString(), "2026-12-01T08:30:00.000Z")
  assert.equal(zonedToUtc("2026-12-01T09:30", "America/New_York")?.toISOString(), "2026-12-01T14:30:00.000Z")
  assert.equal(zonedToUtc("2026-07-01T09:30", "America/New_York")?.toISOString(), "2026-07-01T13:30:00.000Z")
  assert.equal(zonedToUtc("2026-12-01T09:30", "Asia/Kolkata")?.toISOString(), "2026-12-01T04:00:00.000Z")
})

test("zonedToUtc: clock changes", () => {
  // Spring forward in London, 29 Mar 2026: 01:30 does not exist and lands after the gap.
  assert.equal(zonedToUtc("2026-03-29T01:30", "Europe/London")?.toISOString(), "2026-03-29T01:30:00.000Z")
  // Fall back, 25 Oct 2026: 01:30 happens twice, the first (BST) is taken.
  assert.equal(zonedToUtc("2026-10-25T01:30", "Europe/London")?.toISOString(), "2026-10-25T00:30:00.000Z")
})

test("zonedToUtc: rejects what is not a time", () => {
  assert.equal(zonedToUtc("", "UTC"), null)
  assert.equal(zonedToUtc("2026-02-31T10:00", "UTC"), null)
  assert.equal(zonedToUtc("2026-12-01T09:30", "Not/AZone"), null)
})

test("utcToZoned and formatInZone round trip", () => {
  const at = zonedToUtc("2026-12-01T09:30", "America/New_York")!
  assert.equal(utcToZoned(at, "America/New_York"), "2026-12-01T09:30")
  assert.equal(utcToZoned(at.toISOString(), "UTC"), "2026-12-01T14:30")
  assert.match(formatInZone(at, "UTC"), /Tue, 1 Dec 2026, 14:30 UTC|Tue 1 Dec 2026, 14:30 UTC/)
})

test("validateSchedule needs a time at least 5 minutes ahead", () => {
  const now = new Date("2026-12-01T10:00:00Z")
  assert.match(validateSchedule(null, now) ?? "", /Enter a date/)
  assert.match(validateSchedule(new Date("2026-12-01T10:03:00Z"), now) ?? "", /at least 5 minutes/)
  assert.equal(validateSchedule(new Date("2026-12-01T10:05:00Z"), now), null)
})

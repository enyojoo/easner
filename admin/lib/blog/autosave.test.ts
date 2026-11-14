import { test } from "node:test"
import assert from "node:assert/strict"
import { autosaveReducer, initialAutosave, isNewerBackup, nextDelay, savedLabel, type AutosaveEvent, type AutosaveState } from "./autosave.ts"

const run = (events: AutosaveEvent[], from: AutosaveState = initialAutosave) => events.reduce(autosaveReducer, from)

test("edit, save, saved", () => {
  const s = run([{ type: "edit" }, { type: "save-start" }, { type: "save-ok", at: 1000 }])
  assert.equal(s.status, "saved")
  assert.equal(s.savedAt, 1000)
})
test("an edit during a save leaves it dirty afterwards", () => {
  const s = run([{ type: "edit" }, { type: "save-start" }, { type: "edit" }, { type: "save-ok", at: 5 }])
  assert.equal(s.status, "dirty")
  assert.equal(s.pending, false)
})
test("offline keeps edits and returns to dirty when online", () => {
  let s = run([{ type: "edit" }, { type: "save-start" }, { type: "save-fail", message: "x", offline: true }])
  assert.equal(s.status, "offline")
  s = autosaveReducer(s, { type: "edit" })
  assert.equal(s.status, "offline")
  s = autosaveReducer(s, { type: "online" })
  assert.equal(s.status, "dirty")
  assert.equal(s.online, true)
})
test("going offline while saved or idle does not show offline", () => {
  assert.equal(run([{ type: "offline" }]).status, "idle")
  const saved = run([{ type: "edit" }, { type: "save-start" }, { type: "save-ok", at: 1 }, { type: "offline" }])
  assert.equal(saved.status, "saved")
  assert.equal(autosaveReducer(saved, { type: "edit" }).status, "offline")
})
test("an online failure is an error and online brings it back to dirty", () => {
  const s = run([{ type: "edit" }, { type: "save-start" }, { type: "save-fail", message: "boom", offline: false }])
  assert.equal(s.status, "error")
  assert.equal(s.error, "boom")
  assert.equal(autosaveReducer(s, { type: "online" }).status, "dirty")
})
test("labels", () => {
  const saved = (at: number) => ({ ...initialAutosave, status: "saved" as const, savedAt: at })
  assert.equal(savedLabel({ ...initialAutosave, status: "saving" }, 0), "Saving…")
  assert.equal(savedLabel(saved(0), 1000), "Saved just now")
  assert.equal(savedLabel(saved(0), 4000), "Saved 4s ago")
  assert.equal(savedLabel(saved(0), 3 * 60_000), "Saved 3 min ago")
  assert.equal(savedLabel(saved(0), 2 * 3600_000), "Saved 2 h ago")
  assert.equal(savedLabel({ ...initialAutosave, status: "offline" }, 0), "Offline, changes kept on this device")
  assert.equal(savedLabel({ ...initialAutosave, status: "error" }, 0), "Couldn’t save. Retrying…")
  assert.equal(savedLabel(initialAutosave, 0), "")
})
test("nextDelay backs off to 30s", () => {
  assert.deepEqual([0, 1, 2, 3, 4, 99, -1].map(nextDelay), [2000, 5000, 15000, 30000, 30000, 30000, 2000])
})
test("isNewerBackup", () => {
  const server = { updatedAt: "2026-11-14T10:00:00.000Z" }
  const at = Date.parse(server.updatedAt)
  assert.equal(isNewerBackup({ savedAt: at + 1, baseUpdatedAt: null }, server), true)
  assert.equal(isNewerBackup({ savedAt: at - 1, baseUpdatedAt: null }, server), false)
  assert.equal(isNewerBackup({ savedAt: 1, baseUpdatedAt: null }, { updatedAt: "nope" }), true)
})

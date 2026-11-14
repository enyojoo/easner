import { test } from "node:test"
import assert from "node:assert/strict"
import { slugFromTitle, slugLocked, validateSlug } from "./slug.ts"

test("slugFromTitle", () => {
  assert.equal(slugFromTitle("How to pay suppliers abroad, fast!"), "how-to-pay-suppliers-abroad-fast")
  assert.equal(slugFromTitle("Café & crème"), "cafe-and-creme")
  assert.equal(slugFromTitle("  "), "")
  assert.ok(slugFromTitle("a ".repeat(200)).length <= 120)
  assert.ok(!slugFromTitle("word ".repeat(40)).endsWith("-"))
})
test("validateSlug", () => {
  assert.deepEqual(validateSlug("good-slug-2"), { ok: true })
  for (const bad of ["", "Upper", "a--b", "-a", "a-", "a b", "a_b", "x".repeat(121)]) assert.equal(validateSlug(bad).ok, false, bad)
  for (const r of ["categories", "authors", "feed.xml", "page", "search", "preview", "feed"]) assert.equal(validateSlug(r).ok, false, r)
})
test("slugLocked", () => {
  assert.equal(slugLocked({ publishedAt: null, role: "editor" }), false)
  assert.equal(slugLocked({ publishedAt: "2026-11-01T00:00:00Z", role: "editor" }), true)
  assert.equal(slugLocked({ publishedAt: "2026-11-01T00:00:00Z", role: "writer" }), true)
  assert.equal(slugLocked({ publishedAt: "2026-11-01T00:00:00Z", role: "owner" }), false)
  assert.equal(slugLocked({ publishedAt: undefined, role: null }), false)
  assert.equal(slugLocked({ publishedAt: null, role: "editor", status: "scheduled" }), true)
  assert.equal(slugLocked({ publishedAt: null, role: "owner", status: "scheduled" }), false)
  assert.equal(slugLocked({ publishedAt: null, role: "editor", status: "draft" }), false)
})

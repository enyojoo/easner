import { test } from "node:test"
import assert from "node:assert/strict"
import { normalizeFromSlug, validateRedirect } from "./redirects.ts"

const posts = [
  { id: "p1", slug: "live-post", status: "published" },
  { id: "p2", slug: "a-draft", status: "draft" },
]

test("normalizeFromSlug accepts what people paste", () => {
  assert.equal(normalizeFromSlug(" /blog/Old-Post/ "), "old-post")
  assert.equal(normalizeFromSlug("https://easner.com/blog/old-post"), "old-post")
  assert.equal(normalizeFromSlug("old-post"), "old-post")
})

test("a valid redirect passes", () => {
  assert.equal(validateRedirect({ from: "old-news", targetId: "p1", posts, existing: [] }), null)
})

test("refuses a live slug, a loop, a duplicate and a draft target", () => {
  assert.match(validateRedirect({ from: "live-post", targetId: "p1", posts, existing: [] }) ?? "", /already lives/)
  assert.match(validateRedirect({ from: "a-draft", targetId: "p1", posts, existing: [] }) ?? "", /already lives/)
  assert.match(validateRedirect({ from: "old-news", targetId: "p1", posts, existing: [{ from: "old-news", to_post_id: "p1" }] }) ?? "", /already redirects/)
  assert.match(validateRedirect({ from: "old-news", targetId: "p2", posts, existing: [] }) ?? "", /published post/)
  assert.match(validateRedirect({ from: "old-news", targetId: null, posts, existing: [] }) ?? "", /Choose the post/)
})

test("refuses malformed and reserved URLs", () => {
  assert.notEqual(validateRedirect({ from: "Bad Slug!", targetId: "p1", posts, existing: [] }), null)
  assert.notEqual(validateRedirect({ from: "categories", targetId: "p1", posts, existing: [] }), null)
  assert.match(validateRedirect({ from: "", targetId: "p1", posts, existing: [] }) ?? "", /Enter/)
})

import { test } from "node:test"
import assert from "node:assert/strict"
import { KNOWN_SITE_PATHS, isKnownPath } from "./site-routes.ts"

test("known paths", () => {
  for (const p of ["/", "/personal", "/payroll", "/pricing", "/blog", "/personal/", "/personal?x=1", "/pricing#fees"]) assert.ok(isKnownPath(p), p)
  assert.ok(!isKnownPath("/nope"))
  assert.ok(!isKnownPath("/blog/missing"))
  assert.ok(isKnownPath("/blog/my-post", ["my-post"]))
  assert.ok(!isKnownPath("/blog/a/b", ["a"]))
})
test("every product page is known", async () => {
  const { PRODUCT_PAGES } = await import("@easner/blog-content")
  for (const { path } of Object.values(PRODUCT_PAGES)) assert.ok(KNOWN_SITE_PATHS.includes(path), path)
})

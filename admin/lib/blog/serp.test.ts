import { test } from "node:test"
import assert from "node:assert/strict"
import { META_DESCRIPTION_RANGE, META_TITLE_RANGE, finalTitle, lengthState, serpPreview } from "./serp.ts"

test("finalTitle applies the template, unless Easner is in the title", () => {
  assert.deepEqual(finalTitle("Paying suppliers"), { text: "Paying suppliers – Easner", absolute: false })
  assert.deepEqual(finalTitle("Easner launches Payroll"), { text: "Easner launches Payroll", absolute: true })
  assert.equal(finalTitle("Long title", "Short SEO").text, "Short SEO – Easner")
  assert.equal(finalTitle("Easner thing", "Plain SEO").text, "Plain SEO – Easner")
  assert.equal(finalTitle("", "").text, "")
})
test("lengthState", () => {
  assert.equal(lengthState("", META_TITLE_RANGE), "empty")
  assert.equal(lengthState("   ", META_TITLE_RANGE), "empty")
  assert.equal(lengthState("x".repeat(29), META_TITLE_RANGE), "short")
  assert.equal(lengthState("x".repeat(30), META_TITLE_RANGE), "ok")
  assert.equal(lengthState("x".repeat(60), META_TITLE_RANGE), "ok")
  assert.equal(lengthState("x".repeat(61), META_TITLE_RANGE), "long")
  assert.equal(lengthState("x".repeat(156), META_DESCRIPTION_RANGE), "long")
})
test("serpPreview description falls back", () => {
  const base = { title: "T", slug: "t" }
  assert.equal(serpPreview({ ...base, seoDescription: "seo", summary: "s", excerpt: "e" }).description, "seo")
  assert.equal(serpPreview({ ...base, summary: "s", excerpt: "e" }).description, "s")
  assert.equal(serpPreview({ ...base, excerpt: "e" }).description, "e")
  assert.equal(serpPreview(base).description, "")
  assert.equal(serpPreview(base).url, "www.easner.com/blog/t")
  assert.ok(serpPreview({ ...base, excerpt: "x".repeat(300) }).description.length <= 160)
})

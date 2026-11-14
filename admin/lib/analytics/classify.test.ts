import { test } from "node:test"
import assert from "node:assert/strict"
import { classifySource } from "./classify.ts"
import { normalizePath, postSlugFromPath, addDays } from "./paths.ts"
import { isAuthorizedCron } from "./cron-auth.ts"

test("classifySource", () => {
  assert.equal(classifySource("www.google.com"), "search")
  assert.equal(classifySource("chatgpt.com"), "ai")
  assert.equal(classifySource("gemini.google.com"), "ai")
  assert.equal(classifySource("t.co"), "social")
  assert.equal(classifySource("$direct"), "direct")
  assert.equal(classifySource(null), "direct")
  assert.equal(classifySource("some-blog.com"), "referral")
  assert.equal(classifySource("$direct", "linkedin", "share"), "social")
  assert.equal(classifySource("mail.google.com", "dispatch", "email"), "email")
  assert.equal(classifySource("www.google.com", "google", "cpc"), "paid")
  assert.equal(classifySource("$direct", "partner-x", ""), "referral")
})

test("paths", () => {
  assert.equal(normalizePath("https://www.easner.com/blog/a/?utm=1#x"), "/blog/a")
  assert.equal(normalizePath(""), "/")
  assert.equal(normalizePath("pricing//"), "/pricing")
  assert.equal(postSlugFromPath("/blog/a-b/"), "a-b")
  assert.equal(postSlugFromPath("/blog"), null)
  assert.equal(postSlugFromPath("/blog/category/x"), null)
  assert.equal(addDays("2026-03-01", -1), "2026-02-28")
})

test("cron auth", () => {
  assert.equal(isAuthorizedCron("Bearer s3", "s3"), true)
  assert.equal(isAuthorizedCron("Bearer nope", "s3"), false)
  assert.equal(isAuthorizedCron("s3", "s3"), false)
  assert.equal(isAuthorizedCron(null, "s3"), false)
  assert.equal(isAuthorizedCron("Bearer ", null), false)
})

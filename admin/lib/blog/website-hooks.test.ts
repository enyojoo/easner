import { test } from "node:test"
import assert from "node:assert/strict"
import { createHmac } from "node:crypto"
import { revalidateBody, signPreviewToken, verifyPreviewToken, websiteEnv } from "./website-hooks.ts"

test("revalidateBody tags and paths", () => {
  assert.deepEqual(revalidateBody({ slug: "a" }), { tags: ["blog", "blog:post:a"], paths: ["/blog", "/blog/a"] })
  const b = revalidateBody({ slug: "new", oldSlug: "old", categorySlug: "business", oldCategorySlug: "personal", authorSlugs: ["ada", "bo"] })
  assert.deepEqual(b.tags, ["blog", "blog:post:new", "blog:post:old", "blog:category:business", "blog:category:personal", "blog:author:ada", "blog:author:bo"])
  assert.deepEqual(b.paths, ["/blog", "/blog/new", "/blog/old"])
  assert.deepEqual(revalidateBody({ slug: "a", oldSlug: "a" }).tags, ["blog", "blog:post:a"])
})
test("preview token matches the documented format", () => {
  const t = signPreviewToken("11111111-1111-1111-1111-111111111111", "s3cret", 1000)
  const [payload, sig] = t.split(".")
  assert.deepEqual(JSON.parse(Buffer.from(payload, "base64url").toString()), { postId: "11111111-1111-1111-1111-111111111111", exp: 2800 })
  assert.equal(sig, createHmac("sha256", "s3cret").update(payload).digest("base64url"))
  assert.ok(!t.includes("=") && !t.includes("+") && !t.includes("/"))
})
test("verifyPreviewToken", () => {
  const t = signPreviewToken("p", "k", 1000)
  assert.deepEqual(verifyPreviewToken(t, "k", 1500), { postId: "p" })
  assert.equal(verifyPreviewToken(t, "k", 2801), null)
  assert.equal(verifyPreviewToken(t, "other", 1500), null)
  assert.equal(verifyPreviewToken(`${t}x`, "k", 1500), null)
  assert.equal(verifyPreviewToken("garbage", "k", 1500), null)
  assert.equal(verifyPreviewToken("a.b.c", "k", 1500), null)
  const [payload] = t.split(".")
  assert.equal(verifyPreviewToken(`${payload}.`, "k", 1500), null)
})
test("websiteEnv", () => {
  assert.deepEqual(websiteEnv({}), { ok: false, missing: ["WEBSITE_URL", "BLOG_REVALIDATE_SECRET", "BLOG_PREVIEW_SECRET"] })
  assert.deepEqual(websiteEnv({ WEBSITE_URL: "http://x", BLOG_REVALIDATE_SECRET: " " , BLOG_PREVIEW_SECRET: "p" }), { ok: false, missing: ["BLOG_REVALIDATE_SECRET"] })
  assert.deepEqual(websiteEnv({ WEBSITE_URL: "http://x/", BLOG_REVALIDATE_SECRET: "r", BLOG_PREVIEW_SECRET: "p" }), { ok: true, url: "http://x", revalidateSecret: "r", previewSecret: "p" })
  const r = websiteEnv({ WEBSITE_URL: "http://x", BLOG_REVALIDATE_SECRET: "r", BLOG_PREVIEW_SECRET: "p", INDEXNOW_KEY: "k" })
  assert.ok(r.ok && r.indexNowKey === "k")
})

import { test } from "node:test"
import assert from "node:assert/strict"
import { isCronAuthorized, publishDue, type DueDeps } from "./scheduled-publish.ts"

const doc = { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "Hello there" }] }] }

function deps(over: Partial<DueDeps> = {}) {
  const calls: string[] = []
  const base: DueDeps = {
    listDue: async () => [{ id: "a", slug: "post-a" }, { id: "b", slug: "post-b" }],
    loadDoc: async () => doc as never,
    publish: async (id, derived) => {
      calls.push(`publish:${id}:${derived.wordCount}`)
      return { ok: true }
    },
    notify: async (id) => {
      calls.push(`notify:${id}`)
      return { status: "ok" }
    },
  }
  return { calls, deps: { ...base, ...over } }
}

test("publishes each due post, then notifies the website for it", async () => {
  const { calls, deps: d } = deps()
  const result = await publishDue(d)
  assert.equal(result.due, 2)
  assert.deepEqual(result.published.map((row) => row.slug), ["post-a", "post-b"])
  assert.deepEqual(calls, ["publish:a:2", "notify:a", "publish:b:2", "notify:b"])
})

test("nothing due does nothing", async () => {
  const { calls, deps: d } = deps({ listDue: async () => [] })
  const result = await publishDue(d)
  assert.deepEqual(result, { due: 0, published: [], skipped: [], failed: [] })
  assert.deepEqual(calls, [])
})

test("a post another run already published is skipped without notifying again", async () => {
  const { calls, deps: d } = deps({
    listDue: async () => [{ id: "a", slug: "post-a" }],
    publish: async () => ({ ok: false, code: "23514", message: "This post isn't due." }),
  })
  const result = await publishDue(d)
  assert.equal(result.skipped.length, 1)
  assert.equal(result.published.length, 0)
  assert.deepEqual(calls, [])
})

test("one failure doesn't stop the rest, and is reported", async () => {
  let n = 0
  const { deps: d } = deps({
    publish: async () => (n++ === 0 ? { ok: false, message: "A second Editor has to approve it." } : { ok: true }),
  })
  const result = await publishDue(d)
  assert.equal(result.failed[0].message, "A second Editor has to approve it.")
  assert.equal(result.published.length, 1)
})

test("invalid content and thrown errors are failures, never a publish", async () => {
  const bad = { type: "doc", content: [{ type: "image", attrs: { src: "", alt: "" } }] }
  const { calls, deps: d } = deps({
    listDue: async () => [{ id: "a", slug: "a" }, { id: "b", slug: "b" }],
    loadDoc: async (id) => (id === "a" ? (bad as never) : (doc as never)),
    publish: async () => {
      throw new Error("network down")
    },
  })
  const result = await publishDue(d)
  assert.equal(result.failed.length, 2)
  assert.match(result.failed[1].message, /network down/)
  assert.deepEqual(calls, [])
})

test("the batch is bounded", async () => {
  const { deps: d } = deps({ listDue: async () => Array.from({ length: 50 }, (_, i) => ({ id: String(i), slug: `s${i}` })) })
  assert.equal((await publishDue(d, 10)).due, 10)
})

test("cron authorization: Bearer secret only, constant length check, unset secret never matches", () => {
  const secret = "0123456789abcdef0123"
  assert.equal(isCronAuthorized(`Bearer ${secret}`, secret), true)
  assert.equal(isCronAuthorized(`Bearer ${secret}x`, secret), false)
  assert.equal(isCronAuthorized(secret, secret), false)
  assert.equal(isCronAuthorized(null, secret), false)
  assert.equal(isCronAuthorized("Bearer ", secret), false)
  assert.equal(isCronAuthorized(`Bearer ${secret}`, undefined), false)
  assert.equal(isCronAuthorized("Bearer short", "short"), false)
})

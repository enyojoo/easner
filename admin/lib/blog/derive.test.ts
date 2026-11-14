import { test } from "node:test"
import assert from "node:assert/strict"
import type { DocNode } from "@easner/blog-content"
import { deriveFields, prepareSave } from "./derive.ts"

const p = (text: string) => ({ type: "paragraph" as const, content: [{ type: "text" as const, text }] })
const doc: DocNode = {
  type: "doc",
  content: [
    { type: "summary", content: [p("Pay in minutes.")] },
    { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Why it matters" }] },
    p("one two three four"),
    { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Why it matters" }] },
  ],
}

test("deriveFields", () => {
  const d = deriveFields(doc)
  assert.equal(d.summary, "Pay in minutes.")
  assert.equal(d.wordCount, 3 + 3 + 4 + 3)
  assert.equal(d.readingMinutes, 1)
  assert.match(d.contentText, /one two three four/)
})
test("prepareSave adds heading ids", () => {
  const r = prepareSave({ title: "t", doc })
  assert.ok(r.ok)
  if (r.ok) {
    const ids = r.doc.content.filter((b) => b.type === "heading").map((b) => (b as { attrs: { id: string } }).attrs.id)
    assert.deepEqual(ids, ["why-it-matters", "why-it-matters-2"])
  }
})
test("prepareSave rejects bad docs and keeps warnings", () => {
  const bad = prepareSave({ doc: { type: "doc", content: [{ type: "nope" }] } as unknown as DocNode })
  assert.ok(!bad.ok)
  const img: DocNode = { type: "doc", content: [{ type: "image", attrs: { src: "/x.png", alt: "", width: "column" } }] }
  const w = prepareSave({ doc: img })
  assert.ok(w.ok && w.warnings.length === 1)
})

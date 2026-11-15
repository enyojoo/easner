import { test } from "node:test"
import assert from "node:assert/strict"
import { countWords, diffDocs, diffStats, wordDiff } from "./diff.ts"

const p = (text: string) => ({ type: "paragraph", content: [{ type: "text", text }] })
const h = (text: string, level = 2) => ({ type: "heading", attrs: { level }, content: [{ type: "text", text }] })
const doc = (...content: unknown[]) => ({ type: "doc", content })

test("identical documents are all same", () => {
  const rows = diffDocs(doc(h("A"), p("one")), doc(h("A"), p("one")))
  assert.deepEqual(diffStats(rows), { added: 0, removed: 0, changed: 0, same: 2 })
})

test("an added and a removed block", () => {
  const rows = diffDocs(doc(p("one"), p("two")), doc(p("one"), p("two"), h("New heading")))
  assert.equal(rows.at(-1)?.kind, "added")
  const removed = diffDocs(doc(p("one"), h("Gone"), p("two")), doc(p("one"), p("two")))
  assert.deepEqual(removed.map((row) => row.kind), ["same", "removed", "same"])
})

test("a block edited in place is changed, with a word diff", () => {
  const rows = diffDocs(doc(h("Intro"), p("Send money to Nigeria fast")), doc(h("Intro"), p("Send money to Kenya fast")))
  assert.deepEqual(rows.map((row) => row.kind), ["same", "changed"])
  const changed = rows[1]
  assert.equal(changed.kind, "changed")
  if (changed.kind === "changed") {
    assert.deepEqual(changed.words?.filter((part) => part.op !== "same"), [
      { op: "del", text: "Nigeria" },
      { op: "add", text: "Kenya" },
    ])
  }
})

test("different kinds in the same place are a removal and an addition, not a change", () => {
  const rows = diffDocs(doc(p("text")), doc(h("text")))
  assert.deepEqual(rows.map((row) => row.kind), ["removed", "added"])
})

test("images and blocks without text still read", () => {
  const rows = diffDocs(doc({ type: "image", attrs: { src: "https://x/a.png", alt: "A chart" } }), doc({ type: "image", attrs: { src: "https://x/a.png", alt: "A better chart" } }))
  assert.equal(rows[0].kind, "changed")
  if (rows[0].kind === "changed") assert.equal(rows[0].before.text, "A chart")
})

test("lists read on their own lines; null documents are empty", () => {
  const list = { type: "bulletList", content: [{ type: "listItem", content: [p("a")] }, { type: "listItem", content: [p("b")] }] }
  const rows = diffDocs(null, doc(list))
  assert.equal(rows[0].kind, "added")
  if (rows[0].kind === "added") assert.equal(rows[0].after.text, "a\nb")
  assert.deepEqual(diffDocs(null, null), [])
})

test("wordDiff keeps whitespace and merges runs", () => {
  assert.deepEqual(wordDiff("a b c", "a x c"), [
    { op: "same", text: "a " },
    { op: "del", text: "b" },
    { op: "add", text: "x" },
    { op: "same", text: " c" },
  ])
})

test("countWords", () => {
  assert.equal(countWords(doc(h("Two words"), p("and three more"))), 5)
  assert.equal(countWords(null), 0)
})

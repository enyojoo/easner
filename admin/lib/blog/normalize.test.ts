import { test } from "node:test"
import assert from "node:assert/strict"
import { EMPTY_DOC, validateDoc } from "@easner/blog-content"
import { normalizeDoc } from "./normalize.ts"

test("drops attrs Tiptap adds and nulls", () => {
  const doc = normalizeDoc({
    type: "doc",
    content: [
      { type: "heading", attrs: { level: 2, id: null }, content: [{ type: "text", text: "Why" }] },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "link",
            marks: [{ type: "link", attrs: { href: "/personal", target: "_blank", rel: "x", class: null, title: null } }],
          },
        ],
      },
      { type: "codeBlock", attrs: { language: null }, content: [{ type: "text", text: "x" }] },
    ],
  })
  assert.deepEqual(doc.content[0], { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Why" }] })
  assert.deepEqual((doc.content[1] as { content: unknown[] }).content[0], {
    type: "text",
    text: "link",
    marks: [{ type: "link", attrs: { href: "/personal" } }],
  })
  assert.equal("attrs" in doc.content[2], false)
})

test("keeps required empty attrs, drops optional ones", () => {
  const doc = normalizeDoc({
    type: "doc",
    content: [{ type: "image", attrs: { src: "/a.png", alt: "", width: "column", caption: null, mediaId: null, widthPx: 10 } }],
  })
  assert.deepEqual(doc.content[0], { type: "image", attrs: { src: "/a.png", alt: "", width: "column", widthPx: 10 } })
})

test("trims trailing empty paragraphs and empty text, never returns an empty doc", () => {
  const doc = normalizeDoc({
    type: "doc",
    content: [
      { type: "paragraph", content: [{ type: "text", text: "Hello" }, { type: "text", text: "" }] },
      { type: "paragraph" },
      { type: "paragraph" },
    ],
  })
  assert.equal(doc.content.length, 1)
  assert.deepEqual(normalizeDoc({ type: "doc", content: [] }), EMPTY_DOC)
  assert.deepEqual(normalizeDoc(null), EMPTY_DOC)
})

test("table cells lose default spans and colwidth; the result validates", () => {
  const cell = (type: string, text: string) => ({
    type,
    attrs: { colspan: 1, rowspan: 1, colwidth: null },
    content: [{ type: "paragraph", content: [{ type: "text", text }] }],
  })
  const doc = normalizeDoc({
    type: "doc",
    content: [{ type: "table", content: [{ type: "tableRow", content: [cell("tableHeader", "A"), cell("tableCell", "B")] }] }],
  })
  assert.equal(validateDoc(doc).filter((issue) => issue.severity === "error").length, 0)
  assert.equal("attrs" in (doc.content[0] as { content: { content: object[] }[] }).content[0].content[0], false)
})

test("the editor's zero-width menu trigger never reaches storage", () => {
  const doc = normalizeDoc({ type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "​" }] }, { type: "paragraph", content: [{ type: "text", text: "a​b" }] }] })
  assert.deepEqual(doc.content, [{ type: "paragraph" }, { type: "paragraph", content: [{ type: "text", text: "ab" }] }])
})

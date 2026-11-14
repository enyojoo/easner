import { test } from "node:test"
import assert from "node:assert/strict"
import {
  EMPTY_DOC,
  extractFaq,
  extractSteps,
  extractSummary,
  headings,
  internalLinks,
  linkedProductPages,
  plainText,
  readingMinutes,
  slugify,
  validateDoc,
  withHeadingIds,
  wordCount,
  type DocNode,
} from "./index.ts"

const t = (text: string, marks?: { type: "bold" }[]) => ({ type: "text" as const, text, ...(marks ? { marks } : {}) })
const p = (text: string) => ({ type: "paragraph" as const, content: [t(text)] })

const doc: DocNode = {
  type: "doc",
  content: [
    { type: "summary", content: [p("You can receive US payments in your name.")] },
    { type: "heading", attrs: { level: 2 }, content: [t("What to send your client")] },
    p("Share the account details."),
    { type: "heading", attrs: { level: 2 }, content: [t("What to send your client")] },
    {
      type: "paragraph",
      content: [{ type: "text", text: "See Personal Banking", marks: [{ type: "link", attrs: { href: "https://www.easner.com/personal#plans" } }] }],
    },
    { type: "image", attrs: { src: "/storage/a.png", alt: "", width: "column" } },
    {
      type: "faq",
      content: [{ type: "faqItem", attrs: { question: "Do I need a US address?" }, content: [p("No. Your details are issued once verified.")] }],
    },
    { type: "steps", content: [{ type: "step", attrs: { name: "Verify" }, content: [p("Finish verification.")] }] },
    { type: "productCard", attrs: { product: "payroll" } },
  ],
}

test("a good doc has no errors, and flags only the empty alt text", () => {
  const issues = validateDoc(doc)
  assert.deepEqual(issues.filter((i) => i.severity === "error"), [])
  assert.deepEqual(issues.map((i) => i.code), ["image-alt-missing"])
})

test("EMPTY_DOC is valid", () => assert.deepEqual(validateDoc(EMPTY_DOC), []))

test("rejects unknown nodes, bad children, H1, and a missing attr", () => {
  const bad = {
    type: "doc",
    content: [
      { type: "script" },
      { type: "heading", attrs: { level: 1 }, content: [t("Title")] },
      { type: "bulletList", content: [{ type: "paragraph" }] },
      { type: "faq", content: [{ type: "faqItem", attrs: {}, content: [p("x")] }] },
    ],
  }
  const codes = validateDoc(bad).map((i) => i.code)
  assert.ok(codes.includes("unknown-node"))
  assert.ok(codes.includes("bad-attr"))
  assert.ok(codes.includes("bad-child"))
})

test("rejects non-docs and a second Summary", () => {
  assert.equal(validateDoc(null)[0].code, "not-a-doc")
  const two = { type: "doc", content: [{ type: "summary", content: [p("a")] }, { type: "summary", content: [p("b")] }] }
  assert.ok(validateDoc(two).some((i) => i.code === "duplicate-summary"))
})

test("heading ids are unique and withHeadingIds matches headings()", () => {
  const ids = headings(doc).map((h) => h.id)
  assert.deepEqual(ids, ["what-to-send-your-client", "what-to-send-your-client-2"])
  const stamped = withHeadingIds(doc).content.filter((b) => b.type === "heading").map((b) => (b as { attrs: { id?: string } }).attrs.id)
  assert.deepEqual(stamped, ids)
})

test("extraction feeds the schema and llms.txt", () => {
  assert.equal(extractSummary(doc), "You can receive US payments in your name.")
  assert.deepEqual(extractFaq(doc), [{ question: "Do I need a US address?", answer: "No. Your details are issued once verified." }])
  assert.deepEqual(extractSteps(doc), [{ name: "Verify", text: "Finish verification." }])
})

test("internal links include links, cards and strip origin, query and hash", () => {
  assert.deepEqual(internalLinks(doc).sort(), ["/payroll", "/personal"])
  assert.deepEqual(linkedProductPages(doc), ["personal", "payroll"])
})

test("plain text, word count and reading time", () => {
  assert.ok(plainText(doc).includes("Do I need a US address?"))
  assert.ok(wordCount(doc) > 20)
  assert.equal(readingMinutes(0), 1)
  assert.equal(readingMinutes(221), 2)
})

test("slugify", () => {
  assert.equal(slugify("How to get paid: Nigeria & Ghana"), "how-to-get-paid-nigeria-and-ghana")
  assert.equal(slugify("Café"), "cafe")
})

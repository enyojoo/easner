import { test } from "node:test"
import assert from "node:assert/strict"
import type { AnyNode } from "@easner/blog-content"
import { runChecklist, type ChecklistInput } from "./checklist.ts"
import { KNOWN_SITE_PATHS } from "./site-routes.ts"

const p = (text: string, marks?: AnyNode["marks"]): AnyNode => ({ type: "paragraph", content: [{ type: "text", text, ...(marks ? { marks } : {}) }] })
const link = (href: string) => [{ type: "link", attrs: { href } }]
const goodDoc = (): AnyNode => ({
  type: "doc",
  content: [
    { type: "summary", content: [p("Pay suppliers in minutes with a business account.")] },
    { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "How it works" }] },
    p("See Business Banking.", link("/business")),
  ],
})
const base = (): ChecklistInput => ({
  post: {
    id: "1",
    title: "How to pay suppliers abroad without the wait",
    slug: "pay-suppliers",
    seo_title: null,
    seo_description: "A practical guide to paying suppliers abroad in minutes, with fees and exchange rates shown before you confirm.",
    excerpt: null,
    cover_path: "posts/1/cover.webp",
    cover_alt: "A desk with a laptop",
    category_id: "c1",
  },
  doc: goodDoc(),
  authors: [{ id: "a", name: "Ada", title: "Head of Product", avatar_path: "authors/a.webp", bio: { type: "doc", content: [p("Writes about money.")] } }],
  otherPosts: [],
  knownPaths: KNOWN_SITE_PATHS,
  publishedSlugs: [],
})
const run = (mutate: (i: ChecklistInput) => void) => {
  const input = base()
  mutate(input)
  return runChecklist(input)
}
const sev = (r: ReturnType<typeof runChecklist>, id: string) => r.items.find((i) => i.id === id)?.severity

test("a good post passes everything", () => {
  const r = runChecklist(base())
  assert.deepEqual(r.items.filter((i) => i.severity !== "pass"), [])
  assert.equal(r.canPublish, true)
  assert.equal(r.errors, 0)
})
test("title missing", () => assert.equal(sev(run((i) => (i.post.title = " ")), "title"), "error"))
test("meta title length", () => {
  assert.equal(sev(run((i) => (i.post.title = "Short")), "meta-title-length"), "warning")
  assert.equal(sev(run((i) => (i.post.seo_title = "x".repeat(70))), "meta-title-length"), "warning")
})
test("Easner more than once is an error, once is fine", () => {
  assert.equal(sev(run((i) => (i.post.title = "Easner explains how Easner pays suppliers abroad")), "easner-once"), "error")
  assert.equal(sev(run((i) => (i.post.title = "Easner explains how to pay suppliers abroad")), "easner-once"), "pass")
})
test("duplicate title and description", () => {
  const dup = { id: "2", slug: "other", title: "x", seo_title: "HOW to pay suppliers abroad without the wait ", seo_description: null }
  const r = run((i) => (i.otherPosts = [dup]))
  assert.equal(sev(r, "title-unique"), "error")
  const d = run((i) => (i.otherPosts = [{ ...dup, seo_title: null, title: "y", seo_description: i.post.seo_description!.toUpperCase() }]))
  assert.equal(sev(d, "description-unique"), "error")
  const self = run((i) => (i.otherPosts = [{ ...dup, id: "1", slug: "pay-suppliers" }]))
  assert.equal(sev(self, "title-unique"), "pass")
})
test("description falls back to summary then excerpt, and can be missing", () => {
  const none = run((i) => { i.post.seo_description = null; i.doc = { type: "doc", content: [p("x")] } })
  assert.equal(sev(none, "meta-description-length"), "error")
  const fromSummary = run((i) => (i.post.seo_description = null))
  assert.equal(sev(fromSummary, "meta-description-length"), "warning") // summary is 49 chars: short
  assert.equal(sev(run((i) => (i.post.seo_description = "x".repeat(200))), "meta-description-length"), "warning")
})
test("H1 in the body", () => {
  const r = run((i) => i.doc.content!.push({ type: "heading", attrs: { level: 1 }, content: [{ type: "text", text: "Hi" }] }))
  assert.equal(sev(r, "one-h1"), "error")
})
test("cover and cover alt", () => {
  assert.equal(sev(run((i) => (i.post.cover_path = null)), "cover"), "error")
  const r = run((i) => (i.post.cover_alt = " "))
  assert.equal(sev(r, "cover"), "error")
  assert.match(r.items.find((x) => x.id === "cover")!.title, /alt/)
})
test("alt on every image", () => {
  const r = run((i) => i.doc.content!.push({ type: "image", attrs: { src: "/a.png", alt: "", width: "column" } }))
  assert.equal(sev(r, "image-alt"), "error")
  const ok = run((i) => i.doc.content!.push({ type: "image", attrs: { src: "/a.png", alt: "A chart", width: "column" } }))
  assert.equal(sev(ok, "image-alt"), "pass")
})
test("category", () => assert.equal(sev(run((i) => (i.post.category_id = null)), "category"), "error"))
test("authors: none, incomplete, complete", () => {
  assert.equal(sev(run((i) => (i.authors = [])), "authors"), "error")
  assert.equal(sev(run((i) => (i.authors[0].avatar_path = null)), "authors"), "error")
  const missing = run((i) => {
    i.authors[0].title = ""
    i.authors[0].bio = null
  }).items.find((i) => i.id === "authors")
  assert.equal(missing?.severity, "error")
  assert.match(missing?.detail ?? "", /Ada needs a title and a bio\./)
  assert.equal(sev(run((i) => (i.authors[0].bio = null)), "authors"), "error")
  assert.equal(sev(run((i) => (i.authors[0].bio = "Plain text bio")), "authors"), "pass")
})
test("internal links", () => {
  const bad = run((i) => i.doc.content!.push(p("x", link("/nope"))))
  assert.equal(sev(bad, "links"), "error")
  const post = run((i) => { i.doc.content!.push(p("x", link("/blog/other"))); i.publishedSlugs = ["other"] })
  assert.equal(sev(post, "links"), "pass")
  const external = run((i) => i.doc.content!.push(p("x", link("https://example.com/nope"))))
  assert.equal(sev(external, "links"), "pass")
})
test("product page link", () => {
  const r = run((i) => (i.doc = { type: "doc", content: [{ type: "summary", content: [p("Summary text here.")] }] }))
  assert.equal(sev(r, "product-link"), "error")
  const card = run((i) => i.doc.content!.push({ type: "productCard", attrs: { product: "payroll" } }))
  assert.equal(sev(card, "product-link"), "pass")
})
test("doc validity: errors and warnings", () => {
  const bad = run((i) => i.doc.content!.push({ type: "mystery" }))
  assert.equal(sev(bad, "doc-valid"), "error")
  const warn = run((i) => i.doc.content!.splice(1, 0, { type: "summary", content: [p("Second")] }))
  assert.equal(sev(warn, "doc-valid"), "error") // duplicate summary
  const late = run((i) => { i.doc = { type: "doc", content: [p("x", link("/business")), { type: "summary", content: [p("Late summary.")] }] } })
  assert.equal(sev(late, "doc-valid"), "warning")
})
test("brand: errors block, warnings don't", () => {
  const e = run((i) => i.doc.content!.push(p("Instant payouts")))
  assert.equal(sev(e, "brand-errors"), "error")
  assert.equal(e.canPublish, false)
  const w = run((i) => i.doc.content!.push(p("A pause — then more")))
  assert.equal(sev(w, "brand-warnings"), "warning")
  assert.equal(w.canPublish, true)
  assert.equal(w.warnings, 1)
})
test("claims flag is a warning and never imports the claims module", () => {
  const r = run((i) => (i.post.claims_flagged = true))
  assert.equal(sev(r, "claims"), "warning")
  assert.equal(r.canPublish, true)
})

test("summary: warns when missing, never blocks", () => {
  const r = runChecklist(base())
  assert.equal(sev(r, "summary"), "pass")
  const none = run((i) => (i.doc = { type: "doc", content: i.doc.content?.filter((b) => b.type !== "summary") } as ChecklistInput["doc"]))
  assert.equal(sev(none, "summary"), "warning")
  assert.equal(none.canPublish, true)
})

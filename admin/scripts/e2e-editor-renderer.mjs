#!/usr/bin/env node
/**
 * End to end, no Supabase: write a post with every block type in the admin's dev harness, run the publish checklist,
 * publish it, then render the published document through the real website renderer and compare.
 *
 *   1. admin (port 3010):   ADMIN_DEV_HARNESS=1 NODE_ENV=development npx next dev --webpack --port 3010   (in admin/)
 *   2. website (port 3002): BLOG_FIXTURES=1 BLOG_FIXTURE_DOC=/tmp/easner-harness-doc.json npx next dev --webpack --port 3002   (in website/)
 *   3. node admin/scripts/e2e-editor-renderer.mjs          (env: ADMIN_URL, WEBSITE_URL, DOC_FILE, SHOTS)
 *
 * It checks three things and exits 1 on any failure:
 *   A. the editor keeps every node: the document it saves equals the document it was given (nothing dropped or renamed),
 *   B. the publish dialog's checklist runs and publishing in the harness stores that same document,
 *   C. the website renderer shows every node and mark of the published document (text, structure, attributes).
 * Nodes that render differently or are dropped are listed. It only talks to localhost; no hosted service is involved.
 */
import { createRequire } from "node:module"
import { writeFileSync, mkdirSync } from "node:fs"
import { tmpdir } from "node:os"
import path from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"

const here = path.dirname(fileURLToPath(import.meta.url))
const require = createRequire(path.join(here, "../../package.json"))
const { chromium } = require("playwright-core")

const ADMIN = process.env.ADMIN_URL ?? "http://localhost:3010"
const WEBSITE = process.env.WEBSITE_URL ?? "http://localhost:3002"
const DOC_FILE = process.env.DOC_FILE ?? path.join(tmpdir(), "easner-harness-doc.json")
const SHOTS = process.env.SHOTS
if (SHOTS) mkdirSync(SHOTS, { recursive: true })

const { EVERY_BLOCK_DOC } = await import(pathToFileURL(path.join(here, "../app/dev/editor/sample-doc.ts")).href)

const failures = []
const notes = []
const fail = (area, message) => failures.push(`${area}: ${message}`)
const norm = (text) => text.replace(/\s+/g, " ").trim()

// ---------------------------------------------------------------------------------------------------------------
// Document helpers
// ---------------------------------------------------------------------------------------------------------------
function walk(node, visit, parent = null) {
  visit(node, parent)
  for (const child of node.content ?? []) walk(child, visit, node)
}
const textOf = (node) => (node.type === "hardBreak" ? "\n" : node.text ?? (node.content ?? []).map(textOf).join(""))
function countTypes(doc) {
  const counts = {}
  walk(doc, (n) => (counts[n.type] = (counts[n.type] ?? 0) + 1))
  return counts
}
/** The first difference between two documents, as a path, or null. */
function firstDiff(a, b, where = "doc") {
  if (typeof a !== typeof b || Array.isArray(a) !== Array.isArray(b)) return `${where}: ${JSON.stringify(a)?.slice(0, 80)} vs ${JSON.stringify(b)?.slice(0, 80)}`
  if (a === null || typeof a !== "object") return a === b ? null : `${where}: ${JSON.stringify(a)} vs ${JSON.stringify(b)}`
  if (Array.isArray(a)) {
    if (a.length !== b.length) return `${where}: ${a.length} items vs ${b.length}`
    for (let i = 0; i < a.length; i++) {
      const d = firstDiff(a[i], b[i], `${where}[${i}]${a[i]?.type ? `(${a[i].type})` : ""}`)
      if (d) return d
    }
    return null
  }
  for (const key of new Set([...Object.keys(a), ...Object.keys(b)])) {
    const d = firstDiff(a[key], b[key], `${where}.${key}`)
    if (d) return d
  }
  return null
}
/** Treat missing and default attributes alike so the comparison is about content, not serialization. */
function canonical(node) {
  if (Array.isArray(node)) return node.map(canonical)
  if (!node || typeof node !== "object") return node
  const out = {}
  for (const [k, v] of Object.entries(node)) {
    if (v === null || v === undefined) continue
    out[k] = canonical(v)
  }
  // Heading ids are filled in by the editor (and by withHeadingIds on the website); they are not content.
  if (out.type === "heading" && out.attrs) delete out.attrs.id
  if (out.attrs && Object.keys(out.attrs).length === 0) delete out.attrs
  return out
}

// ---------------------------------------------------------------------------------------------------------------
// A and B: the admin harness
// ---------------------------------------------------------------------------------------------------------------
const browser = await chromium.launch()
const admin = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage()
const adminErrors = []
admin.on("pageerror", (e) => adminErrors.push(String(e).slice(0, 200)))

await admin.goto(`${ADMIN}/dev/editor`, { waitUntil: "load" })
await admin.getByRole("button", { name: "Load every block" }).click()
await admin.waitForSelector(".tiptap", { timeout: 15000 })
await admin.waitForTimeout(1200)

// Edit the title so an autosave writes the editor's own serialization of the document.
const title = admin.getByRole("textbox", { name: /title/i }).first()
await title.click()
await title.press("End")
await title.type("!")
await title.press("Backspace")
await admin.waitForTimeout(3500)
const saved = await admin.evaluate(() => window.__harness.snapshot())
const savedDoc = saved.draft_content
if (!savedDoc) fail("A editor", "no draft document was saved")
else {
  const diff = firstDiff(canonical(EVERY_BLOCK_DOC), canonical(savedDoc))
  if (diff) fail("A editor", `the saved document differs from the one loaded: ${diff}`)
  else notes.push("A: the editor saved exactly the document it loaded (every node and mark kept).")
}
if (SHOTS) await admin.screenshot({ path: path.join(SHOTS, "1-editor-every-block.png") })

// Writer submits; the Editor reviews, runs the checklist and publishes.
await admin.getByRole("button", { name: "Submit for review" }).click()
await admin.waitForTimeout(800)
await admin.getByRole("combobox", { name: "Role" }).click()
await admin.getByRole("option", { name: "Editor" }).click()
await admin.waitForTimeout(1200)
await admin.getByRole("button", { name: "Approve and publish" }).click()
await admin.waitForSelector("[role=dialog]", { timeout: 10000 })
const dialogText = norm(await admin.locator("[role=dialog]").first().innerText())
if (SHOTS) await admin.screenshot({ path: path.join(SHOTS, "2-publish-checklist.png") })
if (!/Publish this post\?/.test(dialogText)) fail("B checklist", `the publish dialog did not open (saw: ${dialogText.slice(0, 120)})`)
notes.push(`B: publish dialog text: ${dialogText.slice(0, 400)}`)
if (/must fix|can.t publish|blocked/i.test(dialogText)) fail("B checklist", "the checklist reports blocking items for the every-block post")
const confirm = admin.locator("[role=dialog]").getByRole("button", { name: /^Publish( now)?$/ }).first()
await confirm.click()
await admin.waitForTimeout(1500)
const published = await admin.evaluate(() => window.__harness.snapshot())
if (published.status !== "published") fail("B publish", `status is ${published.status}, expected published`)
else if (!published.content) fail("B publish", "published post has no content")
else {
  const diff = firstDiff(canonical(EVERY_BLOCK_DOC), canonical(published.content))
  if (diff) fail("B publish", `published content differs from the written document: ${diff}`)
  else notes.push("B: the checklist ran, the post published, and the stored content equals the written document.")
  writeFileSync(DOC_FILE, JSON.stringify(published.content, null, 2))
}
if (SHOTS) await admin.screenshot({ path: path.join(SHOTS, "3-published.png") })
if (adminErrors.length) notes.push(`admin page errors: ${[...new Set(adminErrors)].join(" | ")}`)

// ---------------------------------------------------------------------------------------------------------------
// C: the website renderer
// ---------------------------------------------------------------------------------------------------------------
const doc = published.content
const web = await (await browser.newContext({ viewport: { width: 1280, height: 900 } })).newPage()
const response = await web.goto(`${WEBSITE}/blog/harness-document`, { waitUntil: "load" })
if (!response || response.status() !== 200) {
  fail("C renderer", `GET /blog/harness-document answered ${response?.status()}. Start the website with BLOG_FIXTURES=1 BLOG_FIXTURE_DOC=${DOC_FILE}`)
} else {
  await web.waitForSelector(".blog-prose", { timeout: 10000 })
  if (SHOTS) await web.screenshot({ path: path.join(SHOTS, "4-website-render.png"), fullPage: true })
  const rendered = await web.evaluate(() => {
    const root = document.querySelector(".blog-prose")
    const q = (sel) => [...root.querySelectorAll(sel)]
    const text = (el) => (el.textContent ?? "").replace(/\s+/g, " ").trim()
    return {
      text: text(root),
      headings: q("h2,h3,h4").filter((h) => !h.classList.contains("bp-h")).map((h) => ({ tag: h.tagName, text: text(h) })),
      inlineMarks: q("strong,em,u,s,code,a").map((e) => ({ tag: e.tagName, text: text(e), href: e.getAttribute("href"), rel: e.getAttribute("rel"), inPre: !!e.closest("pre") })),
      summary: !!root.querySelector("#summary.bp-summary"),
      lists: { ul: q("ul:not(.bp-tasks)").length, ol: q("ol:not(.bp-steps):not(.bp-src ol)").length, li: q("ul:not(.bp-tasks) > li, ol:not(.bp-steps):not(.bp-src ol) > li").length },
      tasks: q(".bp-tasks input[type=checkbox]").map((i) => i.checked),
      quote: q("blockquote").map((b) => ({ text: text(b.querySelector("p") ?? b), cite: b.querySelector("cite")?.textContent ?? null })),
      code: q(".bp-pre").map((p) => ({ lang: p.querySelector(".lang")?.textContent ?? null, code: p.querySelector("pre code")?.textContent ?? "" })),
      hr: q("hr").length,
      images: q("figure.bp-fig").map((f) => ({ alt: f.querySelector("img")?.getAttribute("alt") ?? null, caption: f.querySelector("figcaption")?.textContent ?? null, w: f.querySelector("img")?.getAttribute("width"), h: f.querySelector("img")?.getAttribute("height") })),
      tables: q("table").map((t) => [...t.rows].map((r) => [...r.cells].map((c) => ({ tag: c.tagName, text: text(c), colspan: c.colSpan, align: c.style.textAlign || null, html: c.innerHTML })))),
      callouts: q(".bp-callout").map((c) => ({ variant: ["info", "warning", "success"].find((v) => c.classList.contains(v)), text: text(c) })),
      takeaways: q(".bp-take").map((t) => ({ heading: text(t.querySelector("h3")), items: [...t.querySelectorAll("li")].map(text) })),
      faq: q(".bp-faq details").map((d) => ({ q: text(d.querySelector("summary")), a: text(d.querySelector(".ans")) })),
      steps: q("ol.bp-steps > li").map((li) => ({ name: text(li.querySelector("b")), body: text(li.querySelector(".st")) })),
      defs: q("dl.bp-defn").map((d) => ({ term: text(d.querySelector("dt")), body: text(d.querySelector("dd")) })),
      ctas: q(".bp-cta").map((c) => ({ heading: c.querySelector("h3")?.textContent ?? null, body: c.querySelector("p")?.textContent ?? null, action: text(c.querySelector("a,button") ?? c) })),
      products: q("a.bp-prod").map((a) => ({ href: a.getAttribute("href"), label: text(a.querySelector("b")) })),
      embeds: q("[class*=bp-emb],[class*=embed]").map((e) => text(e)).concat(q("iframe").map((i) => i.title)),
      buttons: q("a.bp-btn").map((a) => ({ text: text(a), href: a.getAttribute("href") })),
      sources: q(".bp-src li").map((li) => ({ text: text(li), href: li.querySelector("a")?.getAttribute("href") })),
    }
  })

  const ok = (area, condition, message) => condition || fail(`C ${area}`, message)
  const typeCounts = countTypes(doc)
  const flat = []
  walk(doc, (n, parent) => flat.push({ n, parent }))
  const body = norm(rendered.text)

  // Every piece of text appears, in order within its block.
  for (const { n, parent } of flat) {
    if (n.type === "text" && n.text.trim()) ok("text", body.includes(norm(n.text)), `text dropped: "${n.text.slice(0, 60)}" (in ${parent?.type})`)
  }
  // Attribute-only text (these are not text nodes).
  for (const { n } of flat) {
    if (n.type === "cta") for (const k of ["heading", "body"]) if (n.attrs?.[k]) ok("cta", body.includes(norm(n.attrs[k])), `CTA ${k} dropped: ${n.attrs[k]}`)
    if (n.type === "faqItem") ok("faq", body.includes(norm(n.attrs.question)), `FAQ question dropped: ${n.attrs.question}`)
    if (n.type === "step") ok("steps", body.includes(norm(n.attrs.name)), `step name dropped: ${n.attrs.name}`)
    if (n.type === "steps" && n.attrs?.name) notes.push(`steps name "${n.attrs.name}" is an aria-label on the list, not visible text (by design; it feeds HowTo schema).`)
    if (n.type === "definition") ok("definition", body.includes(norm(n.attrs.term)), `definition term dropped: ${n.attrs.term}`)
    if (n.type === "blockquote" && n.attrs?.attribution) ok("blockquote", body.includes(norm(n.attrs.attribution)), `attribution dropped: ${n.attrs.attribution}`)
    if (n.type === "image" && n.attrs.caption) ok("image", body.includes(norm(n.attrs.caption)), `caption dropped: ${n.attrs.caption}`)
    if (n.type === "sourceItem") ok("sources", body.includes(norm(n.attrs.title)), `source title dropped: ${n.attrs.title}`)
    if (n.type === "button") ok("button", rendered.buttons.some((b) => b.text === norm(n.attrs.label) && b.href === n.attrs.href), `button "${n.attrs.label}" → ${n.attrs.href} missing or different`)
    if (n.type === "productCard") ok("productCard", rendered.products.length >= 1, "product card dropped")
  }
  // Marks.
  const markTag = { bold: "STRONG", italic: "EM", underline: "U", strike: "S", code: "CODE", link: "A" }
  for (const { n } of flat) {
    if (n.type !== "text") continue
    for (const mark of n.marks ?? []) {
      const found = rendered.inlineMarks.some((e) => e.tag === markTag[mark.type] && e.text.includes(norm(n.text)) && (mark.type !== "link" || e.href === mark.attrs.href))
      ok("marks", found, `mark ${mark.type} on "${n.text}" not rendered as <${markTag[mark.type].toLowerCase()}>`)
      if (mark.type === "link" && mark.attrs.sponsored) {
        const el = rendered.inlineMarks.find((e) => e.tag === "A" && e.href === mark.attrs.href)
        ok("marks", Boolean(el && /sponsored/.test(el.rel ?? "")), `sponsored link ${mark.attrs.href} lacks rel=sponsored`)
      }
    }
  }
  // Structure per node type.
  ok("summary", !typeCounts.summary || rendered.summary, "summary block not rendered with #summary")
  const wantHeadings = flat.filter(({ n }) => n.type === "heading").map(({ n }) => ({ tag: `H${n.attrs.level}`, text: norm(textOf(n)) }))
  ok("headings", JSON.stringify(wantHeadings) === JSON.stringify(rendered.headings), `headings differ: wanted ${JSON.stringify(wantHeadings)}, got ${JSON.stringify(rendered.headings)}`)
  ok("lists", rendered.lists.ul === (typeCounts.bulletList ?? 0), `bullet lists: doc has ${typeCounts.bulletList} (one sits inside key takeaways), page has ${rendered.lists.ul}`)
  ok("lists", rendered.lists.ol === (typeCounts.orderedList ?? 0), `ordered lists: doc ${typeCounts.orderedList}, page ${rendered.lists.ol}`)
  const wantTasks = flat.filter(({ n }) => n.type === "taskItem").map(({ n }) => Boolean(n.attrs.checked))
  ok("taskList", JSON.stringify(wantTasks) === JSON.stringify(rendered.tasks), `task states differ: ${JSON.stringify(wantTasks)} vs ${JSON.stringify(rendered.tasks)}`)
  const wantQuotes = flat.filter(({ n }) => n.type === "blockquote").map(({ n }) => ({ text: norm(textOf(n.content[0])), cite: n.attrs?.attribution ?? null }))
  ok("blockquote", JSON.stringify(wantQuotes) === JSON.stringify(rendered.quote), `blockquotes differ: ${JSON.stringify(wantQuotes)} vs ${JSON.stringify(rendered.quote)}`)
  const wantCode = flat.filter(({ n }) => n.type === "codeBlock").map(({ n }) => ({ lang: n.attrs?.language ?? null, code: textOf(n) }))
  ok("codeBlock", JSON.stringify(wantCode) === JSON.stringify(rendered.code), `code blocks differ: ${JSON.stringify(wantCode)} vs ${JSON.stringify(rendered.code)}`)
  ok("horizontalRule", rendered.hr === (typeCounts.horizontalRule ?? 0), `rules: doc ${typeCounts.horizontalRule}, page ${rendered.hr}`)
  const wantImages = flat.filter(({ n }) => n.type === "image").map(({ n }) => ({ alt: n.attrs.alt, caption: n.attrs.caption ?? null }))
  ok("image", JSON.stringify(wantImages) === JSON.stringify(rendered.images.map(({ alt, caption }) => ({ alt, caption }))), `images differ: ${JSON.stringify(wantImages)} vs ${JSON.stringify(rendered.images)}`)
  rendered.images.forEach((i) => ok("image", Boolean(i.w && i.h), "image without width and height (layout shift)"))
  // Tables: rows, cells, spans, alignment, and every paragraph of every cell.
  flat.filter(({ n }) => n.type === "table").forEach(({ n }, t) => {
    const got = rendered.tables[t]
    ok("table", Boolean(got), "table not rendered")
    if (!got) return
    ok("table", got.length === n.content.length, `table rows: doc ${n.content.length}, page ${got.length}`)
    n.content.forEach((row, r) =>
      row.content.forEach((cell, c) => {
        const cellOut = got[r]?.[c]
        ok("table", Boolean(cellOut), `table cell ${r},${c} missing`)
        if (!cellOut) return
        const want = cell.content.map((p) => norm(textOf(p)))
        for (const piece of want) ok("table", cellOut.text.includes(piece), `table cell ${r},${c} lost text "${piece}" (page shows "${cellOut.text}")`)
        ok("table", cellOut.tag === (cell.type === "tableHeader" ? "TH" : "TD"), `table cell ${r},${c} is <${cellOut.tag}>`)
        ok("table", cellOut.colspan === (cell.attrs?.colspan ?? 1), `table cell ${r},${c} colspan ${cellOut.colspan}, doc ${cell.attrs?.colspan ?? 1}`)
        ok("table", (cellOut.align ?? null) === (cell.attrs?.align ?? null), `table cell ${r},${c} align ${cellOut.align}, doc ${cell.attrs?.align ?? null}`)
      }),
    )
  })
  const wantCallouts = flat.filter(({ n }) => n.type === "callout").map(({ n }) => ({ variant: n.attrs.variant, text: norm(textOf(n)) }))
  ok("callout", JSON.stringify(wantCallouts) === JSON.stringify(rendered.callouts), `callouts differ: ${JSON.stringify(wantCallouts)} vs ${JSON.stringify(rendered.callouts)}`)
  const wantTakeItems = []
  for (const { n } of flat) if (n.type === "keyTakeaways") wantTakeItems.push(n.content.flatMap((list) => list.content.map((li) => norm(textOf(li)))))
  ok("keyTakeaways", JSON.stringify(wantTakeItems) === JSON.stringify(rendered.takeaways.map((t) => t.items)), `key takeaways differ: ${JSON.stringify(wantTakeItems)} vs ${JSON.stringify(rendered.takeaways.map((t) => t.items))}`)
  const wantFaq = flat.filter(({ n }) => n.type === "faqItem").map(({ n }) => ({ q: n.attrs.question, a: norm(textOf(n)) }))
  ok("faq", JSON.stringify(wantFaq) === JSON.stringify(rendered.faq), `FAQ differs: ${JSON.stringify(wantFaq)} vs ${JSON.stringify(rendered.faq)}`)
  const wantSteps = flat.filter(({ n }) => n.type === "step").map(({ n }) => n.attrs.name)
  ok("steps", JSON.stringify(wantSteps) === JSON.stringify(rendered.steps.map((s) => s.name)), `steps differ: ${JSON.stringify(wantSteps)} vs ${JSON.stringify(rendered.steps.map((s) => s.name))}`)
  const wantDefs = flat.filter(({ n }) => n.type === "definition").map(({ n }) => ({ term: n.attrs.term, body: norm(textOf(n)) }))
  ok("definition", JSON.stringify(wantDefs) === JSON.stringify(rendered.defs), `definitions differ: ${JSON.stringify(wantDefs)} vs ${JSON.stringify(rendered.defs)}`)
  ok("cta", rendered.ctas.length === (typeCounts.cta ?? 0), `CTAs: doc ${typeCounts.cta}, page ${rendered.ctas.length}`)
  ok("productCard", rendered.products.length === (typeCounts.productCard ?? 0), `product cards: doc ${typeCounts.productCard}, page ${rendered.products.length}`)
  ok("embed", rendered.embeds.length >= (typeCounts.embed ?? 0), `embeds: doc ${typeCounts.embed}, page ${rendered.embeds.length}`)
  const wantSources = flat.filter(({ n }) => n.type === "sourceItem").map(({ n }) => n.attrs.url)
  ok("sources", JSON.stringify(wantSources) === JSON.stringify(rendered.sources.map((s) => s.href)), `sources differ: ${JSON.stringify(wantSources)} vs ${JSON.stringify(rendered.sources.map((s) => s.href))}`)
  ok("hardBreak", !typeCounts.hardBreak || rendered.text.includes("after a line break"), "text after a hard break is missing")

  // Every node type that exists in the document was looked at above.
  const covered = new Set(["doc", "text", "paragraph", "heading", "bulletList", "orderedList", "listItem", "taskList", "taskItem", "blockquote", "codeBlock", "horizontalRule", "image", "table", "tableRow", "tableCell", "tableHeader", "callout", "summary", "keyTakeaways", "faq", "faqItem", "steps", "step", "definition", "cta", "productCard", "embed", "sources", "sourceItem", "button", "hardBreak"])
  for (const type of Object.keys(typeCounts)) if (!covered.has(type)) fail("C coverage", `node type ${type} is in the document but this script has no check for it`)
  notes.push(`C: compared ${Object.keys(typeCounts).length} node types, ${flat.length} nodes against ${WEBSITE}/blog/harness-document.`)
}

await browser.close()
console.log(notes.map((n) => `  ${n}`).join("\n"))
if (failures.length) {
  console.log(`\nFAILED (${failures.length}):\n- ${failures.join("\n- ")}`)
  process.exit(1)
}
console.log("\nPASS: the editor and the website renderer agree on every node type.")

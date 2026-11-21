/**
 * @easner/blog-content: the blog post document format.
 *
 * `blog_posts.content` and `blog_posts.draft_content` hold a `DocNode` (ProseMirror / Tiptap JSON). The admin editor
 * writes it, the website renders it, and both use these types and helpers so the two can never disagree about what a
 * node is called or what it carries. No stored HTML. Plan: docs/blog-and-admin-plan.md §2 decision 3 and §3a.
 *
 * Zero dependencies and no relative imports, so it runs in Next (server and client), Node and the tests.
 */

// ---------------------------------------------------------------------------------------------------------------
// Marks and inline nodes
// ---------------------------------------------------------------------------------------------------------------

export type Mark =
  | { type: "bold" | "italic" | "underline" | "strike" | "code" }
  | { type: "link"; attrs: { href: string; title?: string; sponsored?: boolean } }

export interface TextNode {
  type: "text"
  text: string
  marks?: Mark[]
}
export interface HardBreakNode {
  type: "hardBreak"
}
export type InlineNode = TextNode | HardBreakNode

// ---------------------------------------------------------------------------------------------------------------
// Block nodes
// ---------------------------------------------------------------------------------------------------------------

export type ProductSlug =
  | "personal"
  | "business"
  | "checkout"
  | "payment-links"
  | "invoicing"
  | "payroll"
  | "stablecoin"
  | "cards"
  | "developers"
  | "partners"

export type ImageWidth = "column" | "wide" | "full"
export type CalloutVariant = "info" | "warning" | "success"
export type EmbedProvider = "youtube" | "vimeo" | "loom" | "x" | "other"
export type CtaVariant = "open-account" | "download-app" | "book-call" | "custom"

export interface ParagraphNode {
  type: "paragraph"
  content?: InlineNode[]
}
/** H2 to H4 only. The post title is the page's one H1. `id` is filled by `withHeadingIds`. */
export interface HeadingNode {
  type: "heading"
  attrs: { level: 2 | 3 | 4; id?: string }
  content?: InlineNode[]
}
export interface ListItemNode {
  type: "listItem"
  content: SimpleBlock[]
}
export interface BulletListNode {
  type: "bulletList"
  content: ListItemNode[]
}
export interface OrderedListNode {
  type: "orderedList"
  content: ListItemNode[]
}
export interface TaskItemNode {
  type: "taskItem"
  attrs: { checked: boolean }
  content: SimpleBlock[]
}
export interface TaskListNode {
  type: "taskList"
  content: TaskItemNode[]
}
export interface BlockquoteNode {
  type: "blockquote"
  attrs?: { attribution?: string }
  content: ParagraphNode[]
}
export interface CodeBlockNode {
  type: "codeBlock"
  attrs?: { language?: string }
  content?: TextNode[]
}
export interface HorizontalRuleNode {
  type: "horizontalRule"
}
/** `src` is the Supabase Storage public path; `mediaId` points at `blog_media`. `alt` is required to publish. */
export interface ImageNode {
  type: "image"
  attrs: {
    mediaId?: string
    src: string
    alt: string
    caption?: string
    width: ImageWidth
    widthPx?: number
    heightPx?: number
  }
}
export interface TableCellNode {
  type: "tableCell" | "tableHeader"
  attrs?: { colspan?: number; rowspan?: number; align?: "left" | "center" | "right" }
  content: ParagraphNode[]
}
export interface TableRowNode {
  type: "tableRow"
  content: TableCellNode[]
}
export interface TableNode {
  type: "table"
  content: TableRowNode[]
}

// Easner blocks ---------------------------------------------------------------------------------------------------

export interface CalloutNode {
  type: "callout"
  attrs: { variant: CalloutVariant }
  content: SimpleBlock[]
}
/** The direct answer, 2 to 3 sentences. At most one, and it must be the first block. Rendered with `.aeo-answer`. */
export interface SummaryNode {
  type: "summary"
  content: ParagraphNode[]
}
export interface KeyTakeawaysNode {
  type: "keyTakeaways"
  content: SimpleBlock[]
}
export interface FaqItemNode {
  type: "faqItem"
  attrs: { question: string }
  content: SimpleBlock[]
}
/** Renders the visible Q&A and emits FAQPage JSON-LD from the same data. */
export interface FaqNode {
  type: "faq"
  content: FaqItemNode[]
}
export interface StepNode {
  type: "step"
  attrs: { name: string }
  content: SimpleBlock[]
}
/** Renders numbered steps and emits HowTo JSON-LD. */
export interface StepsNode {
  type: "steps"
  attrs?: { name?: string }
  content: StepNode[]
}
/** Renders a defined term and emits DefinedTerm JSON-LD. */
export interface DefinitionNode {
  type: "definition"
  attrs: { term: string }
  content: ParagraphNode[]
}
export interface CtaNode {
  type: "cta"
  attrs: { variant: CtaVariant; heading?: string; body?: string; label?: string; href?: string }
}
export interface ProductCardNode {
  type: "productCard"
  attrs: { product: ProductSlug }
}
export interface EmbedNode {
  type: "embed"
  attrs: { provider: EmbedProvider; url: string; title?: string }
}
export interface SourceItemNode {
  type: "sourceItem"
  attrs: { title: string; url: string; publisher?: string }
}
export interface SourcesNode {
  type: "sources"
  content: SourceItemNode[]
}
export interface ButtonNode {
  type: "button"
  attrs: { label: string; href: string }
}

/** Blocks allowed inside containers (list items, callouts, FAQ answers, steps). No nesting of Easner blocks. */
export type SimpleBlock =
  | ParagraphNode
  | BulletListNode
  | OrderedListNode
  | BlockquoteNode
  | CodeBlockNode
  | ImageNode

export type BlockNode =
  | ParagraphNode
  | HeadingNode
  | BulletListNode
  | OrderedListNode
  | TaskListNode
  | BlockquoteNode
  | CodeBlockNode
  | HorizontalRuleNode
  | ImageNode
  | TableNode
  | CalloutNode
  | SummaryNode
  | KeyTakeawaysNode
  | FaqNode
  | StepsNode
  | DefinitionNode
  | CtaNode
  | ProductCardNode
  | EmbedNode
  | SourcesNode
  | ButtonNode

export interface DocNode {
  type: "doc"
  content: BlockNode[]
}

/** Loose shape the helpers walk, so they accept anything ProseMirror hands back. */
export interface AnyNode {
  type: string
  attrs?: Record<string, unknown>
  content?: AnyNode[]
  text?: string
  marks?: { type: string; attrs?: Record<string, unknown> }[]
}

export const EMPTY_DOC: DocNode = { type: "doc", content: [{ type: "paragraph" }] }

// ---------------------------------------------------------------------------------------------------------------
// Site constants the editor and the renderer share
// ---------------------------------------------------------------------------------------------------------------

/** Post slugs that would collide with /blog/<section>. The admin and the database both refuse them. */
export const BLOG_RESERVED_SLUGS = ["categories", "authors", "feed.xml", "page", "search", "preview"] as const

export const PRODUCT_PAGES: Record<ProductSlug, { label: string; path: string }> = {
  personal: { label: "Personal Banking", path: "/personal" },
  business: { label: "Business Banking", path: "/business" },
  checkout: { label: "Checkout", path: "/checkout" },
  "payment-links": { label: "Payment Links", path: "/payment-links" },
  invoicing: { label: "Invoicing", path: "/invoicing" },
  payroll: { label: "Payroll", path: "/payroll" },
  stablecoin: { label: "Stablecoin", path: "/stablecoin" },
  cards: { label: "Cards", path: "/cards" },
  developers: { label: "Developers", path: "/developers" },
  partners: { label: "White-label", path: "/white-label" },
}

export const SITE_ORIGIN = "https://www.easner.com"
export const WORDS_PER_MINUTE = 220

// ---------------------------------------------------------------------------------------------------------------
// Walking and text
// ---------------------------------------------------------------------------------------------------------------

const isInline = (node: AnyNode) => node.type === "text" || node.type === "hardBreak"

export function walk(node: AnyNode, visit: (node: AnyNode, parent: AnyNode | null) => void, parent: AnyNode | null = null) {
  visit(node, parent)
  for (const child of node.content ?? []) walk(child, visit, node)
}

/** Plain text of a node. Blocks are separated by a newline. Question, step, term and caption attrs are included. */
export function plainText(node: AnyNode): string {
  if (node.type === "text") return node.text ?? ""
  if (node.type === "hardBreak") return "\n"
  const parts: string[] = []
  const a = node.attrs ?? {}
  if (node.type === "faqItem" && typeof a.question === "string") parts.push(a.question)
  if (node.type === "step" && typeof a.name === "string") parts.push(a.name)
  if (node.type === "definition" && typeof a.term === "string") parts.push(a.term)
  if (node.type === "image" && typeof a.caption === "string") parts.push(a.caption)
  const children = node.content ?? []
  if (children.length && children.every(isInline)) {
    parts.push(children.map(plainText).join(""))
  } else {
    for (const child of children) {
      const text = plainText(child)
      if (text) parts.push(text)
    }
  }
  return parts.join("\n")
}

const oneLine = (text: string) => text.replace(/\s+/g, " ").trim()

export function wordCount(doc: AnyNode): number {
  const text = plainText(doc).trim()
  return text ? text.split(/\s+/).length : 0
}

export function readingMinutes(words: number): number {
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE))
}

// ---------------------------------------------------------------------------------------------------------------
// Headings, table of contents
// ---------------------------------------------------------------------------------------------------------------

export function slugify(text: string): string {
  return text
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export interface HeadingInfo {
  level: 2 | 3 | 4
  text: string
  id: string
}

/** Heading ids, unique within the post (`why-it-matters`, `why-it-matters-2`). Used by the TOC and the anchors. */
export function headings(doc: AnyNode): HeadingInfo[] {
  const seen = new Map<string, number>()
  const out: HeadingInfo[] = []
  for (const block of doc.content ?? []) {
    if (block.type !== "heading") continue
    const text = oneLine(plainText(block))
    const given = typeof block.attrs?.id === "string" ? block.attrs.id : ""
    const base = given || slugify(text) || "section"
    const n = (seen.get(base) ?? 0) + 1
    seen.set(base, n)
    out.push({ level: (block.attrs?.level as 2 | 3 | 4) ?? 2, text, id: n === 1 ? base : `${base}-${n}` })
  }
  return out
}

/** A copy of the doc with every heading's `attrs.id` set, so anchors match `headings(doc)` exactly. */
export function withHeadingIds(doc: DocNode): DocNode {
  const ids = headings(doc)
  let i = 0
  return {
    ...doc,
    content: doc.content.map((block) =>
      block.type === "heading" ? { ...block, attrs: { ...block.attrs, id: ids[i++].id } } : block,
    ),
  }
}

// ---------------------------------------------------------------------------------------------------------------
// Extraction for schema, llms.txt, search and the editor's AEO tab
// ---------------------------------------------------------------------------------------------------------------

function blocksOfType(doc: AnyNode, type: string): AnyNode[] {
  return (doc.content ?? []).filter((block) => block.type === type)
}

/** The Summary block's text, or null. */
export function extractSummary(doc: AnyNode): string | null {
  const block = blocksOfType(doc, "summary")[0]
  return block ? oneLine(plainText(block)) : null
}

export function extractFaq(doc: AnyNode): { question: string; answer: string }[] {
  const out: { question: string; answer: string }[] = []
  for (const faq of blocksOfType(doc, "faq")) {
    for (const item of faq.content ?? []) {
      const question = String(item.attrs?.question ?? "").trim()
      const answer = oneLine((item.content ?? []).map(plainText).join(" "))
      if (question && answer) out.push({ question, answer })
    }
  }
  return out
}

export function extractSteps(doc: AnyNode): { name: string; text: string }[] {
  const out: { name: string; text: string }[] = []
  for (const steps of blocksOfType(doc, "steps")) {
    for (const step of steps.content ?? []) {
      const name = String(step.attrs?.name ?? "").trim()
      const text = oneLine((step.content ?? []).map(plainText).join(" "))
      if (name && text) out.push({ name, text })
    }
  }
  return out
}

export function extractDefinitions(doc: AnyNode): { term: string; text: string }[] {
  return blocksOfType(doc, "definition")
    .map((d) => ({ term: String(d.attrs?.term ?? "").trim(), text: oneLine((d.content ?? []).map(plainText).join(" ")) }))
    .filter((d) => d.term && d.text)
}

export function extractSources(doc: AnyNode): { title: string; url: string; publisher?: string }[] {
  const out: { title: string; url: string; publisher?: string }[] = []
  for (const sources of blocksOfType(doc, "sources")) {
    for (const item of sources.content ?? []) {
      const a = item.attrs ?? {}
      if (typeof a.title === "string" && typeof a.url === "string") {
        out.push({ title: a.title, url: a.url, publisher: typeof a.publisher === "string" ? a.publisher : undefined })
      }
    }
  }
  return out
}

export interface ImageInfo {
  src: string
  alt: string
  caption?: string
  mediaId?: string
}

export function extractImages(doc: AnyNode): ImageInfo[] {
  const out: ImageInfo[] = []
  walk(doc, (node) => {
    if (node.type === "image") {
      const a = node.attrs ?? {}
      out.push({
        src: String(a.src ?? ""),
        alt: String(a.alt ?? ""),
        caption: typeof a.caption === "string" ? a.caption : undefined,
        mediaId: typeof a.mediaId === "string" ? a.mediaId : undefined,
      })
    }
  })
  return out
}

/** Site-internal paths the post links to (link marks, buttons, CTAs, product cards), deduplicated, without origin. */
export function internalLinks(doc: AnyNode): string[] {
  const found = new Set<string>()
  const add = (href: unknown) => {
    if (typeof href !== "string") return
    const path = href.startsWith(SITE_ORIGIN) ? href.slice(SITE_ORIGIN.length) || "/" : href
    if (path.startsWith("/") && !path.startsWith("//")) found.add(path.split(/[?#]/)[0] || "/")
  }
  walk(doc, (node) => {
    for (const mark of node.marks ?? []) if (mark.type === "link") add(mark.attrs?.href)
    if (node.type === "button" || node.type === "cta") add(node.attrs?.href)
    if (node.type === "productCard") {
      const product = PRODUCT_PAGES[node.attrs?.product as ProductSlug]
      if (product) add(product.path)
    }
  })
  return [...found]
}

/** Product pages the post links to (by card, CTA or link), in site order. Posts need at least one to publish. */
export function linkedProductPages(doc: AnyNode): ProductSlug[] {
  const links = new Set(internalLinks(doc))
  return (Object.keys(PRODUCT_PAGES) as ProductSlug[]).filter((slug) => links.has(PRODUCT_PAGES[slug].path))
}

export function externalLinks(doc: AnyNode): string[] {
  const found = new Set<string>()
  walk(doc, (node) => {
    for (const mark of node.marks ?? []) {
      const href = mark.type === "link" ? mark.attrs?.href : undefined
      if (typeof href === "string" && /^https?:\/\//.test(href) && !href.startsWith(SITE_ORIGIN)) found.add(href)
    }
  })
  return [...found]
}

// ---------------------------------------------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------------------------------------------

export type IssueSeverity = "error" | "warning"
export interface ValidationIssue {
  severity: IssueSeverity
  code: string
  message: string
  /** Index path from the doc root, e.g. [3, 0, 1] */
  path: number[]
}

const SIMPLE_BLOCKS = ["paragraph", "bulletList", "orderedList", "blockquote", "codeBlock", "image"]
const TOP_BLOCKS = [
  "paragraph", "heading", "bulletList", "orderedList", "taskList", "blockquote", "codeBlock", "horizontalRule", "image",
  "table", "callout", "summary", "keyTakeaways", "faq", "steps", "definition", "cta", "productCard", "embed", "sources",
  "button",
]

type Children = readonly string[] | "inline" | "text" | "none"
interface Spec {
  children: Children
  min?: number
  attrs?: Record<string, (value: unknown) => boolean>
}
const str = (v: unknown) => typeof v === "string" && v.trim().length > 0
const oneOf = (...values: unknown[]) => (v: unknown) => values.includes(v)
const url = (v: unknown) => typeof v === "string" && /^(https?:\/\/|\/)/.test(v)

const SPEC: Record<string, Spec> = {
  paragraph: { children: "inline" },
  heading: { children: "inline", attrs: { level: oneOf(2, 3, 4) } },
  bulletList: { children: ["listItem"], min: 1 },
  orderedList: { children: ["listItem"], min: 1 },
  listItem: { children: SIMPLE_BLOCKS, min: 1 },
  taskList: { children: ["taskItem"], min: 1 },
  taskItem: { children: SIMPLE_BLOCKS, min: 1, attrs: { checked: (v) => typeof v === "boolean" } },
  blockquote: { children: ["paragraph"], min: 1 },
  codeBlock: { children: "text" },
  horizontalRule: { children: "none" },
  image: { children: "none", attrs: { src: url, width: oneOf("column", "wide", "full") } },
  table: { children: ["tableRow"], min: 1 },
  tableRow: { children: ["tableCell", "tableHeader"], min: 1 },
  tableCell: { children: ["paragraph"], min: 1 },
  tableHeader: { children: ["paragraph"], min: 1 },
  callout: { children: SIMPLE_BLOCKS, min: 1, attrs: { variant: oneOf("info", "warning", "success") } },
  summary: { children: ["paragraph"], min: 1 },
  keyTakeaways: { children: SIMPLE_BLOCKS, min: 1 },
  faq: { children: ["faqItem"], min: 1 },
  faqItem: { children: SIMPLE_BLOCKS, min: 1, attrs: { question: str } },
  steps: { children: ["step"], min: 1 },
  step: { children: SIMPLE_BLOCKS, min: 1, attrs: { name: str } },
  definition: { children: ["paragraph"], min: 1, attrs: { term: str } },
  cta: { children: "none", attrs: { variant: oneOf("open-account", "download-app", "book-call", "custom") } },
  productCard: { children: "none", attrs: { product: (v) => typeof v === "string" && v in PRODUCT_PAGES } },
  embed: { children: "none", attrs: { provider: oneOf("youtube", "vimeo", "loom", "x", "other"), url } },
  sources: { children: ["sourceItem"], min: 1 },
  sourceItem: { children: "none", attrs: { title: str, url } },
  button: { children: "none", attrs: { label: str, href: url } },
}

/**
 * Structural check of a document. Errors mean the doc can't be rendered safely (unknown node, wrong child, missing
 * attr). Warnings are publish-time editorial problems (empty alt text, Summary not first). The admin runs this on
 * every save and its pre-publish checklist; the website runs it before rendering and renders nothing it rejects.
 */
export function validateDoc(doc: unknown): ValidationIssue[] {
  const issues: ValidationIssue[] = []
  const add = (severity: IssueSeverity, code: string, message: string, path: number[]) =>
    issues.push({ severity, code, message, path })

  if (!doc || typeof doc !== "object" || (doc as AnyNode).type !== "doc" || !Array.isArray((doc as AnyNode).content)) {
    return [{ severity: "error", code: "not-a-doc", message: "Content is not a document.", path: [] }]
  }

  const check = (node: AnyNode, path: number[]) => {
    const spec = SPEC[node.type]
    if (!spec) return add("error", "unknown-node", `Unknown node "${node.type}".`, path)
    for (const [name, valid] of Object.entries(spec.attrs ?? {})) {
      if (!valid(node.attrs?.[name])) add("error", "bad-attr", `"${node.type}" has an invalid "${name}".`, path)
    }
    const kids = node.content ?? []
    if (spec.children === "none") {
      if (kids.length) add("error", "unexpected-children", `"${node.type}" cannot have content.`, path)
      return
    }
    if (spec.children === "inline" || spec.children === "text") {
      kids.forEach((kid, i) => {
        const ok = spec.children === "text" ? kid.type === "text" : isInline(kid)
        if (!ok) return add("error", "bad-child", `"${kid.type}" is not allowed inside "${node.type}".`, [...path, i])
        for (const mark of kid.marks ?? []) {
          if (spec.children === "text" && mark.type) add("error", "bad-mark", "Code blocks cannot carry marks.", [...path, i])
          else if (mark.type === "link" && !url(mark.attrs?.href) && !String(mark.attrs?.href ?? "").startsWith("mailto:"))
            add("error", "bad-link", "A link has an unusable address.", [...path, i])
          else if (!["bold", "italic", "underline", "strike", "code", "link"].includes(mark.type))
            add("error", "bad-mark", `Unknown mark "${mark.type}".`, [...path, i])
        }
      })
      return
    }
    if (spec.min && kids.length < spec.min) add("error", "empty-node", `"${node.type}" needs content.`, path)
    kids.forEach((kid, i) => {
      if (!spec.children.includes(kid.type))
        add("error", "bad-child", `"${kid.type}" is not allowed inside "${node.type}".`, [...path, i])
      check(kid, [...path, i])
    })
  }

  const blocks = (doc as AnyNode).content ?? []
  blocks.forEach((block, i) => {
    if (!TOP_BLOCKS.includes(block.type) && SPEC[block.type]) {
      add("error", "bad-child", `"${block.type}" is not allowed at the top level.`, [i])
    }
    check(block, [i])
    if (block.type === "summary" && i !== 0) add("warning", "summary-not-first", "The Summary should be the first block.", [i])
    if (block.type === "image" && !String(block.attrs?.alt ?? "").trim()) {
      add("warning", "image-alt-missing", "An image has no alt text.", [i])
    }
    if (block.type === "heading" && block.attrs?.level === 1) add("error", "bad-attr", "H1 is reserved for the post title.", [i])
  })
  if (blocks.filter((b) => b.type === "summary").length > 1) add("error", "duplicate-summary", "Only one Summary is allowed.", [])
  walk(doc as AnyNode, (node) => {
    if (node.type === "image" && !String(node.attrs?.alt ?? "").trim() && !blocks.includes(node))
      add("warning", "image-alt-missing", "An image has no alt text.", [])
  })
  return issues
}

export const isValidDoc = (doc: unknown) => !validateDoc(doc).some((issue) => issue.severity === "error")

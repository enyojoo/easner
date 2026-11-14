/**
 * Turns what Tiptap's `getJSON()` returns into exactly the document `@easner/blog-content` describes: only known
 * attrs, no nulls, no empty text nodes, no trailing empty paragraphs. Pure, so it runs under `node --test`.
 */
import { EMPTY_DOC, type AnyNode, type DocNode } from "@easner/blog-content"

/** Attrs each node type may carry. Anything else Tiptap adds (colwidth, class, target…) is dropped. */
const NODE_ATTRS: Record<string, readonly string[]> = {
  heading: ["level", "id"],
  blockquote: ["attribution"],
  codeBlock: ["language"],
  image: ["mediaId", "src", "alt", "caption", "width", "widthPx", "heightPx"],
  taskItem: ["checked"],
  tableCell: ["colspan", "rowspan", "align"],
  tableHeader: ["colspan", "rowspan", "align"],
  callout: ["variant"],
  faqItem: ["question"],
  step: ["name"],
  steps: ["name"],
  definition: ["term"],
  cta: ["variant", "heading", "body", "label", "href"],
  productCard: ["product"],
  embed: ["provider", "url", "title"],
  sourceItem: ["title", "url", "publisher"],
  button: ["label", "href"],
}

/** Attrs that must stay even when empty (the validator and the renderer expect the key). */
const KEEP_EMPTY = new Set(["image.alt", "faqItem.question", "step.name", "definition.term", "sourceItem.title", "sourceItem.url", "button.label", "button.href", "embed.url"])

const isEmpty = (value: unknown) => value === null || value === undefined || value === ""

function cleanAttrs(type: string, attrs: Record<string, unknown> | undefined): Record<string, unknown> | undefined {
  const allowed = NODE_ATTRS[type]
  if (!allowed || !attrs) return undefined
  const out: Record<string, unknown> = {}
  for (const key of allowed) {
    const value = attrs[key]
    if (isEmpty(value) && !KEEP_EMPTY.has(`${type}.${key}`)) continue
    if ((key === "colspan" || key === "rowspan") && value === 1) continue
    if (key === "align" && value === "left") continue
    out[key] = value ?? ""
  }
  return Object.keys(out).length ? out : undefined
}

function cleanMarks(marks: AnyNode["marks"]): AnyNode["marks"] {
  if (!marks?.length) return undefined
  const out = marks.map((mark) => {
    if (mark.type !== "link") return { type: mark.type }
    const attrs: Record<string, unknown> = { href: String(mark.attrs?.href ?? "") }
    if (!isEmpty(mark.attrs?.title)) attrs.title = mark.attrs?.title
    if (mark.attrs?.sponsored === true) attrs.sponsored = true
    return { type: "link", attrs }
  })
  return out
}

function cleanNode(node: AnyNode): AnyNode | null {
  if (node.type === "text") {
    // The editor's invisible menu trigger (a zero-width space) never reaches storage.
    const text = node.text?.replace(/\u200b/g, "")
    if (!text) return null
    const marks = cleanMarks(node.marks)
    return marks ? { type: "text", text, marks } : { type: "text", text }
  }
  const out: AnyNode = { type: node.type }
  const attrs = cleanAttrs(node.type, node.attrs)
  if (attrs) out.attrs = attrs
  if (node.content?.length) {
    const kids = node.content.map(cleanNode).filter((kid): kid is AnyNode => kid !== null)
    if (kids.length) out.content = kids
  }
  return out
}

const isEmptyParagraph = (node: AnyNode) => node.type === "paragraph" && !node.content?.length

/** The doc to store. Always has at least one block. */
export function normalizeDoc(json: unknown): DocNode {
  const root = json as AnyNode | null
  if (!root || root.type !== "doc") return EMPTY_DOC
  const blocks = (root.content ?? []).map(cleanNode).filter((node): node is AnyNode => node !== null)
  while (blocks.length > 1 && isEmptyParagraph(blocks[blocks.length - 1])) blocks.pop()
  if (!blocks.length) return EMPTY_DOC
  return { type: "doc", content: blocks } as DocNode
}

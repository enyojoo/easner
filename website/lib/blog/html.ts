import { PRODUCT_PAGES, plainText, type AnyNode, type DocNode, type ProductSlug } from "@easner/blog-content"
import { abs, mediaUrl } from "./urls"

const esc = (value: unknown) =>
  String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")
const absHref = (href: string) => (href.startsWith("/") ? abs(href) : href)
const safeHref = (href: string) => (/^(https?:\/\/|\/|mailto:)/.test(href) ? esc(absHref(href)) : "#")

function inline(nodes: AnyNode[] | undefined): string {
  return (nodes ?? [])
    .map((node) => {
      if (node.type === "hardBreak") return "<br/>"
      let out = esc(node.text)
      for (const mark of node.marks ?? []) {
        if (mark.type === "bold") out = `<strong>${out}</strong>`
        else if (mark.type === "italic") out = `<em>${out}</em>`
        else if (mark.type === "underline") out = `<u>${out}</u>`
        else if (mark.type === "strike") out = `<s>${out}</s>`
        else if (mark.type === "code") out = `<code>${out}</code>`
        else if (mark.type === "link") out = `<a href="${safeHref(String(mark.attrs?.href ?? ""))}">${out}</a>`
      }
      return out
    })
    .join("")
}

const blocks = (nodes: AnyNode[] | undefined) => (nodes ?? []).map(block).join("")
const items = (node: AnyNode) => (node.content ?? []).map((item) => `<li>${blocks(item.content)}</li>`).join("")

function block(node: AnyNode): string {
  const a = node.attrs ?? {}
  switch (node.type) {
    case "paragraph": return `<p>${inline(node.content)}</p>`
    case "heading": return `<h${a.level}>${inline(node.content)}</h${a.level}>`
    case "bulletList":
    case "taskList": return `<ul>${items(node)}</ul>`
    case "orderedList": return `<ol>${items(node)}</ol>`
    case "blockquote": return `<blockquote>${blocks(node.content)}${a.attribution ? `<p>— ${esc(a.attribution)}</p>` : ""}</blockquote>`
    case "codeBlock": return `<pre><code>${esc((node.content ?? []).map((t) => t.text ?? "").join(""))}</code></pre>`
    case "horizontalRule": return "<hr/>"
    case "image": {
      const src = esc(absHref(mediaUrl(String(a.src ?? ""))))
      return `<figure><img src="${src}" alt="${esc(a.alt)}"/>${a.caption ? `<figcaption>${esc(a.caption)}</figcaption>` : ""}</figure>`
    }
    case "table":
      return `<table>${(node.content ?? [])
        .map((row) => `<tr>${(row.content ?? []).map((cell) => `<${cell.type === "tableHeader" ? "th" : "td"}>${inline(cell.content?.[0]?.content)}</${cell.type === "tableHeader" ? "th" : "td"}>`).join("")}</tr>`)
        .join("")}</table>`
    case "callout": return `<blockquote>${blocks(node.content)}</blockquote>`
    case "summary": return `<blockquote><strong>Summary</strong>${blocks(node.content)}</blockquote>`
    case "keyTakeaways": return `<h3>Key takeaways</h3>${blocks(node.content)}`
    case "faq": return (node.content ?? []).map((item) => `<h3>${esc(item.attrs?.question)}</h3>${blocks(item.content)}`).join("")
    case "steps": return `<ol>${(node.content ?? []).map((s) => `<li><strong>${esc(s.attrs?.name)}</strong>${blocks(s.content)}</li>`).join("")}</ol>`
    case "definition": return `<p><strong>${esc(a.term)}</strong>: ${(node.content ?? []).map((p) => inline(p.content)).join(" ")}</p>`
    case "cta": return a.heading ? `<p><strong>${esc(a.heading)}</strong>${a.body ? ` ${esc(a.body)}` : ""}</p>` : ""
    case "productCard": {
      const product = PRODUCT_PAGES[a.product as ProductSlug]
      return product ? `<p><a href="${abs(product.path)}">${esc(product.label)}</a></p>` : ""
    }
    case "embed": return `<p><a href="${safeHref(String(a.url ?? ""))}">${esc(a.title ?? a.url)}</a></p>`
    case "sources": return `<h3>Sources</h3><ol>${(node.content ?? []).map((s) => `<li><a href="${safeHref(String(s.attrs?.url ?? ""))}">${esc(s.attrs?.title)}</a></li>`).join("")}</ol>`
    case "button": return `<p><a href="${safeHref(String(a.href ?? ""))}">${esc(a.label)}</a></p>`
    default: return `<p>${esc(plainText(node))}</p>`
  }
}

/** Static HTML of a doc, for RSS `content:encoded`. Everything is escaped; hrefs are limited to http(s), mailto and paths. */
export function docToHtml(doc: DocNode): string {
  return blocks(doc.content)
}

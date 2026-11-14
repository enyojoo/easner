import { PRODUCT_PAGES, plainText, type AnyNode, type DocNode, type ProductSlug } from "@easner/blog-content"
import { mediaUrl, abs } from "./urls"
import type { BlogPost } from "./types"

const absHref = (href: string) => (href.startsWith("/") ? abs(href) : href)
const absSrc = (src: string) => absHref(mediaUrl(src))

function inline(nodes: AnyNode[] | undefined): string {
  return (nodes ?? [])
    .map((node) => {
      if (node.type === "hardBreak") return "  \n"
      let out = node.text ?? ""
      for (const mark of node.marks ?? []) {
        if (mark.type === "code") out = `\`${out}\``
        else if (mark.type === "bold") out = `**${out}**`
        else if (mark.type === "italic") out = `_${out}_`
        else if (mark.type === "strike") out = `~~${out}~~`
        else if (mark.type === "link") out = `[${out}](${absHref(String(mark.attrs?.href ?? ""))})`
      }
      return out
    })
    .join("")
}

const indent = (text: string, prefix: string) =>
  text
    .split("\n")
    .map((line, i) => (i === 0 ? line : line ? prefix + line : line))
    .join("\n")

function blocks(nodes: AnyNode[] | undefined): string {
  return (nodes ?? []).map(block).filter(Boolean).join("\n\n")
}

function list(node: AnyNode, marker: (i: number) => string): string {
  return (node.content ?? [])
    .map((item, i) => {
      const check = item.type === "taskItem" ? (item.attrs?.checked ? "[x] " : "[ ] ") : ""
      return `${marker(i)}${check}${indent(blocks(item.content), "   ")}`
    })
    .join("\n")
}

const quote = (text: string) => text.split("\n").map((l) => `> ${l}`.trimEnd()).join("\n")

function block(node: AnyNode): string {
  const a = node.attrs ?? {}
  switch (node.type) {
    case "paragraph":
      return inline(node.content)
    case "heading":
      return `${"#".repeat(Number(a.level ?? 2))} ${inline(node.content)}`
    case "bulletList":
    case "taskList":
      return list(node, () => "- ")
    case "orderedList":
      return list(node, (i) => `${i + 1}. `)
    case "blockquote":
      return quote(`${blocks(node.content)}${a.attribution ? `\n\n— ${a.attribution}` : ""}`)
    case "codeBlock":
      return `\`\`\`${a.language ?? ""}\n${(node.content ?? []).map((t) => t.text ?? "").join("")}\n\`\`\``
    case "horizontalRule":
      return "---"
    case "image":
      return `![${a.alt ?? ""}](${absSrc(String(a.src ?? ""))})${a.caption ? `\n\n_${a.caption}_` : ""}`
    case "table": {
      const rows = (node.content ?? []).map((row) => (row.content ?? []).map((cell) => inline(cell.content?.[0]?.content).replace(/\|/g, "\\|")))
      if (!rows.length) return ""
      const [head, ...body] = rows
      return [`| ${head.join(" | ")} |`, `| ${head.map(() => "---").join(" | ")} |`, ...body.map((r) => `| ${r.join(" | ")} |`)].join("\n")
    }
    case "callout": {
      const label = { info: "Note", warning: "Warning", success: "Tip" }[String(a.variant)] ?? "Note"
      return quote(`**${label}:** ${blocks(node.content)}`)
    }
    case "summary":
      return `**Summary:** ${blocks(node.content)}`
    case "keyTakeaways":
      return `**Key takeaways**\n\n${blocks(node.content)}`
    case "faq":
      return (node.content ?? []).map((item) => `### ${item.attrs?.question}\n\n${blocks(item.content)}`).join("\n\n")
    case "steps": {
      const title = a.name ? `**${a.name}**\n\n` : ""
      return title + (node.content ?? []).map((step, i) => `${i + 1}. **${step.attrs?.name}**: ${indent(blocks(step.content), "   ")}`).join("\n")
    }
    case "definition":
      return `**${a.term}**: ${blocks(node.content)}`
    case "cta": {
      const parts = [a.heading ? `**${a.heading}**` : null, a.body ? String(a.body) : null].filter(Boolean).join(" ")
      const label = String(a.label ?? "")
      return [parts, a.href && label ? `[${label}](${absHref(String(a.href))})` : ""].filter(Boolean).join("\n\n")
    }
    case "productCard": {
      const product = PRODUCT_PAGES[a.product as ProductSlug]
      return product ? `[${product.label}](${abs(product.path)})` : ""
    }
    case "embed":
      return `[${a.title ?? a.url}](${a.url})`
    case "sources":
      return `**Sources**\n\n${(node.content ?? [])
        .map((s, i) => `${i + 1}. [${s.attrs?.title}](${s.attrs?.url})${s.attrs?.publisher ? `, ${s.attrs.publisher}` : ""}`)
        .join("\n")}`
    case "button":
      return `[${a.label}](${absHref(String(a.href ?? ""))})`
    default:
      return plainText(node)
  }
}

export function docToMarkdown(doc: DocNode): string {
  return blocks(doc.content)
}

/** The clean Markdown version of a post, served at /blog/<slug>.md and used by llms-full.txt. */
export function postToMarkdown(post: BlogPost, options: { url: string }): string {
  const authors = post.authors.map((a) => a.name).join(", ")
  const head = [
    `# ${post.title}`,
    "",
    `${authors ? `By ${authors}. ` : ""}Published ${post.publishedAt.slice(0, 10)}${post.contentModifiedAt ? `, updated ${post.contentModifiedAt.slice(0, 10)}` : ""}. Category: ${post.category.name}.`,
    "",
    `Source: ${options.url}`,
    "",
  ]
  const hasSummary = post.content.content[0]?.type === "summary"
  return [...head, post.excerpt && !hasSummary ? `${post.excerpt}\n` : "", docToMarkdown(post.content), ""].join("\n")
}

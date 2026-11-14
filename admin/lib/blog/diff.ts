/**
 * Block level diff of two post documents, for the History panel. Top level blocks are compared whole (any change
 * inside a block makes it "changed"), and a changed text block gets a word level diff. Pure, tested.
 */
type AnyNode = { type?: string; attrs?: Record<string, unknown>; content?: AnyNode[]; text?: string }

export type BlockSummary = { type: string; label: string; text: string; key: string }
export type WordPart = { op: "same" | "add" | "del"; text: string }
export type DiffRow =
  | { kind: "same"; before: BlockSummary; after: BlockSummary }
  | { kind: "added"; after: BlockSummary }
  | { kind: "removed"; before: BlockSummary }
  | { kind: "changed"; before: BlockSummary; after: BlockSummary; words: WordPart[] | null }

const LABELS: Record<string, string> = {
  paragraph: "Paragraph",
  bulletList: "Bulleted list",
  orderedList: "Numbered list",
  taskList: "Checklist",
  blockquote: "Quote",
  codeBlock: "Code",
  horizontalRule: "Divider",
  image: "Image",
  table: "Table",
  callout: "Callout",
  summary: "Summary",
  keyTakeaways: "Key takeaways",
  faq: "FAQ",
  steps: "Steps",
  definition: "Definition",
  cta: "Call to action",
  productCard: "Product card",
  embed: "Embed",
  sources: "Sources",
  button: "Button",
}

const textOf = (node: AnyNode): string => {
  if (typeof node.text === "string") return node.text
  if (node.type === "hardBreak") return "\n"
  const children = node.content ?? []
  const parts = children.map(textOf)
  // Block children (list items, rows, faq entries) read on their own lines; inline children run together.
  const inline = children.every((child) => child.type === "text" || child.type === "hardBreak")
  return inline ? parts.join("") : parts.filter(Boolean).join("\n")
}

function summarize(node: AnyNode): BlockSummary {
  const type = node.type ?? "unknown"
  let label = LABELS[type] ?? type.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase())
  if (type === "heading") label = `Heading ${String(node.attrs?.level ?? 2)}`
  let text = textOf(node).trim()
  if (!text && node.attrs) {
    const attrs = node.attrs
    text = [attrs.alt, attrs.url, attrs.src, attrs.href].find((value): value is string => typeof value === "string" && value.length > 0) ?? ""
  }
  return { type, label, text, key: JSON.stringify(node) }
}

export function summarizeDoc(doc: unknown): BlockSummary[] {
  const content = (doc as AnyNode | null)?.content
  return Array.isArray(content) ? content.map(summarize) : []
}

/** Longest common subsequence of two arrays by key: pairs of indexes, in order. */
function lcs<T>(a: T[], b: T[], same: (x: T, y: T) => boolean): Array<[number, number]> {
  const table: number[][] = Array.from({ length: a.length + 1 }, () => new Array<number>(b.length + 1).fill(0))
  for (let i = a.length - 1; i >= 0; i -= 1) {
    for (let j = b.length - 1; j >= 0; j -= 1) {
      table[i][j] = same(a[i], b[j]) ? table[i + 1][j + 1] + 1 : Math.max(table[i + 1][j], table[i][j + 1])
    }
  }
  const pairs: Array<[number, number]> = []
  let i = 0
  let j = 0
  while (i < a.length && j < b.length) {
    if (same(a[i], b[j])) {
      pairs.push([i, j])
      i += 1
      j += 1
    } else if (table[i + 1][j] >= table[i][j + 1]) i += 1
    else j += 1
  }
  return pairs
}

export function wordDiff(before: string, after: string): WordPart[] {
  const a = before.split(/(\s+)/).filter((part) => part !== "")
  const b = after.split(/(\s+)/).filter((part) => part !== "")
  const pairs = lcs(a, b, (x, y) => x === y)
  const parts: WordPart[] = []
  const push = (op: WordPart["op"], text: string) => {
    const last = parts[parts.length - 1]
    if (last && last.op === op) last.text += text
    else parts.push({ op, text })
  }
  let i = 0
  let j = 0
  for (const [pi, pj] of [...pairs, [a.length, b.length] as [number, number]]) {
    while (i < pi) push("del", a[i++])
    while (j < pj) push("add", b[j++])
    if (pi < a.length) {
      push("same", a[pi])
      i = pi + 1
      j = pj + 1
    }
  }
  return parts
}

export function diffDocs(before: unknown, after: unknown): DiffRow[] {
  const a = summarizeDoc(before)
  const b = summarizeDoc(after)
  const anchors = lcs(a, b, (x, y) => x.key === y.key)
  const rows: DiffRow[] = []
  let i = 0
  let j = 0
  const gap = (endA: number, endB: number) => {
    const removed = a.slice(i, endA)
    const added = b.slice(j, endB)
    // Blocks of the same kind that sit in the same place are one block that changed.
    let r = 0
    let k = 0
    while (r < removed.length || k < added.length) {
      const was = removed[r]
      const now = added[k]
      if (was && now && was.type === now.type) {
        rows.push({ kind: "changed", before: was, after: now, words: was.text || now.text ? wordDiff(was.text, now.text) : null })
        r += 1
        k += 1
      } else if (was) {
        rows.push({ kind: "removed", before: was })
        r += 1
      } else {
        rows.push({ kind: "added", after: now })
        k += 1
      }
    }
  }
  for (const [pi, pj] of anchors) {
    gap(pi, pj)
    rows.push({ kind: "same", before: a[pi], after: b[pj] })
    i = pi + 1
    j = pj + 1
  }
  gap(a.length, b.length)
  return rows
}

export function diffStats(rows: DiffRow[]): { added: number; removed: number; changed: number; same: number } {
  const count = { added: 0, removed: 0, changed: 0, same: 0 }
  for (const row of rows) count[row.kind] += 1
  return count
}

/** Words in a document (the same split the database uses for a revision's word count). */
export function countWords(doc: unknown): number {
  return summarizeDoc(doc).reduce((sum, block) => sum + (block.text ? block.text.split(/\s+/).filter(Boolean).length : 0), 0)
}

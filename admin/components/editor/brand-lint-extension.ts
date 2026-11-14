"use client"

import { Extension } from "@tiptap/react"
import { Plugin, PluginKey } from "@tiptap/pm/state"
import { Decoration, DecorationSet } from "@tiptap/pm/view"
import type { Node as PMNode } from "@tiptap/pm/model"
import { lintText } from "@/lib/blog/brand-lint"

/** Position inside a textblock for a character offset into its text content. Inline atoms count as zero width. */
function posAt(block: PMNode, blockStart: number, offset: number): number {
  let remaining = offset
  let result = blockStart + 1
  block.forEach((child, childOffset) => {
    if (remaining < 0) return
    const size = child.isText ? (child.text?.length ?? 0) : 0
    if (remaining <= size) {
      result = blockStart + 1 + childOffset + remaining
      remaining = -1
    } else {
      remaining -= size
      result = blockStart + 1 + childOffset + child.nodeSize
    }
  })
  return result
}

function decorate(doc: PMNode): DecorationSet {
  const decorations: Decoration[] = []
  doc.descendants((node, pos) => {
    if (!node.isTextblock || node.type.name === "codeBlock") return
    for (const issue of lintText(node.textContent)) {
      const from = posAt(node, pos, issue.from)
      const to = posAt(node, pos, issue.to)
      if (to <= from) continue
      decorations.push(
        Decoration.inline(from, to, {
          class: issue.severity === "error" ? "brand-lint brand-lint-error" : "brand-lint brand-lint-warning",
          title: `${issue.reason}${issue.suggestion ? ` Say instead: ${issue.suggestion}` : ""}`,
        }),
      )
    }
    return false
  })
  return DecorationSet.create(doc, decorations)
}

/** Wavy underlines for phrases the brand guardrails ban (red) or want qualified (amber), with the suggestion on hover. */
export const BrandLint = Extension.create({
  name: "brandLint",
  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey("brandLint"),
        state: {
          init: (_config, state) => decorate(state.doc),
          apply: (tr, old) => (tr.docChanged ? decorate(tr.doc) : old),
        },
        props: {
          decorations(state) {
            return this.getState(state)
          },
        },
      }),
    ]
  },
})

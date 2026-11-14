import type { AnyNode } from "@easner/blog-content"
import rulesJson from "./brand-rules.json" with { type: "json" }

/**
 * Brand-voice lint against the guardrails (data: brand-rules.json, built from VOICE-AND-GUARDRAILS.md).
 * Banned phrases are errors and block publishing; missing qualifiers and em-dashes are warnings.
 */
export interface BrandIssue {
  severity: "error" | "warning"
  rule: string
  match: string
  suggestion: string
  reason: string
  /** Index path from the doc root to the block (or node with the attr) holding the text. */
  path: number[]
  /** Character range of `match` inside that block's text (or attr). */
  from: number
  to: number
}

interface BannedRule { id: string; phrase: string; pattern: string; flags: string; replacement: string; reason: string }
interface QualifierRule { id: string; claim: string; qualifier: string; trigger: string; satisfied: string; flags: string }
interface Rules {
  banned: BannedRule[]
  qualifiers: QualifierRule[]
  emDash: { pattern: string; replacement: string; reason: string }
}
const rules = rulesJson as unknown as Rules

const compiled = {
  banned: rules.banned.map((r) => ({ r, re: new RegExp(r.pattern, `${r.flags}g`) })),
  qualifiers: rules.qualifiers.map((r) => ({
    r,
    trigger: new RegExp(r.trigger, `${r.flags}g`),
    satisfied: new RegExp(r.satisfied, r.flags),
  })),
  emDash: new RegExp(rules.emDash.pattern, "g"),
}

export function lintText(text: string, path: number[] = []): BrandIssue[] {
  const out: BrandIssue[] = []
  if (!text.trim()) return out
  for (const { r, re } of compiled.banned) {
    re.lastIndex = 0
    for (const m of text.matchAll(re)) {
      out.push({
        severity: "error",
        rule: r.id,
        match: m[0],
        suggestion: r.replacement,
        reason: r.reason,
        path,
        from: m.index ?? 0,
        to: (m.index ?? 0) + m[0].length,
      })
    }
  }
  for (const q of compiled.qualifiers) {
    if (q.satisfied.test(text)) continue
    q.trigger.lastIndex = 0
    for (const m of text.matchAll(q.trigger)) {
      out.push({
        severity: "warning",
        rule: q.r.id,
        match: m[0],
        suggestion: `Add the qualifier: ${q.r.qualifier}`,
        reason: `"${q.r.claim}" needs a qualifier.`,
        path,
        from: m.index ?? 0,
        to: (m.index ?? 0) + m[0].length,
      })
    }
  }
  compiled.emDash.lastIndex = 0
  for (const m of text.matchAll(compiled.emDash)) {
    out.push({
      severity: "warning",
      rule: "em-dash",
      match: m[0],
      suggestion: rules.emDash.replacement,
      reason: rules.emDash.reason,
      path,
      from: m.index ?? 0,
      to: (m.index ?? 0) + 1,
    })
  }
  return out.sort((a, b) => a.from - b.from)
}

const isInline = (n: AnyNode) => n.type === "text" || n.type === "hardBreak"
const blockText = (n: AnyNode) => (n.content ?? []).map((c) => (c.type === "hardBreak" ? "\n" : (c.text ?? ""))).join("")
const ATTRS: Record<string, string[]> = {
  faqItem: ["question"],
  step: ["name"],
  definition: ["term"],
  image: ["alt", "caption"],
  cta: ["heading", "body", "label"],
  button: ["label"],
  sourceItem: ["title"],
}

/** Lints every text block (and the visible attrs: questions, step names, captions, CTA copy). Code blocks are skipped. */
export function lintDoc(doc: AnyNode): BrandIssue[] {
  const out: BrandIssue[] = []
  const visit = (node: AnyNode, path: number[]) => {
    for (const name of ATTRS[node.type] ?? []) {
      const v = node.attrs?.[name]
      if (typeof v === "string") out.push(...lintText(v, path))
    }
    const kids = node.content ?? []
    if (node.type !== "codeBlock" && kids.length && kids.every(isInline)) {
      out.push(...lintText(blockText(node), path))
      return
    }
    kids.forEach((kid, i) => visit(kid, [...path, i]))
  }
  ;(doc.content ?? []).forEach((block, i) => visit(block, [i]))
  return out
}

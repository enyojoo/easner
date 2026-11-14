import { plainText, type AnyNode } from "@easner/blog-content"
import patterns from "./claims-patterns.json" with { type: "json" }

export interface ClaimPattern {
  id: string
  category: string
  label: string
  pattern: string
}

export interface ClaimMatch {
  id: string
  category: string
  label: string
  /** The words that matched, with a little context. */
  text: string
  /** Index path of the top-level block it was found in (empty for title/excerpt). */
  path?: number[]
  where: "title" | "excerpt" | "body"
}

export interface ClaimsResult {
  flagged: boolean
  matches: ClaimMatch[]
}

export const CLAIM_PATTERNS: readonly ClaimPattern[] = patterns as ClaimPattern[]

const compiled = CLAIM_PATTERNS.map((p) => ({ ...p, re: new RegExp(p.pattern, "i") }))

function scan(text: string, where: ClaimMatch["where"], path: number[] | undefined, out: ClaimMatch[]) {
  if (!text.trim()) return
  for (const p of compiled) {
    const m = p.re.exec(text)
    if (!m) continue
    const start = Math.max(0, m.index - 20)
    const snippet = text.slice(start, m.index + m[0].length + 20).replace(/\s+/g, " ").trim()
    out.push({ id: p.id, category: p.category, label: p.label, text: snippet, where, ...(path ? { path } : {}) })
  }
}

/**
 * Flags copy that needs a second Editor (plan §8 decision 2). The database runs the same patterns (blog_claim_patterns)
 * and is the authority; this is for the editor's banner and the checklist.
 */
export function checkClaims(input: { title?: string | null; excerpt?: string | null; doc?: AnyNode | null }): ClaimsResult {
  const matches: ClaimMatch[] = []
  scan(input.title ?? "", "title", undefined, matches)
  scan(input.excerpt ?? "", "excerpt", undefined, matches)
  ;(input.doc?.content ?? []).forEach((block, i) => scan(plainText(block), "body", [i], matches))
  return { flagged: matches.length > 0, matches }
}

/** Distinct claim categories found, for `blog_posts.claims_matches`-style display. */
export function claimCategories(result: ClaimsResult): string[] {
  return [...new Set(result.matches.map((m) => m.category))]
}

#!/usr/bin/env node
/**
 * Builds lib/blog/brand-rules.json from the brand guardrails (docs/marketing/VOICE-AND-GUARDRAILS.md in easnerbanking).
 * The app reads only the JSON. Run after the guardrails change:
 *   npm run build:brand-rules -w admin          (VOICE_GUARDRAILS_PATH overrides the markdown path)
 *
 * The markdown gives the phrases, replacements, reasons and claim qualifiers. The regexes that find them in prose
 * live here, keyed by phrase; the script fails if the markdown has a phrase this file doesn't know, so the two can't
 * drift silently.
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const here = path.dirname(fileURLToPath(import.meta.url))
const source =
  process.env.VOICE_GUARDRAILS_PATH ||
  path.resolve(here, "../../../../../easnerbanking/docs/marketing/VOICE-AND-GUARDRAILS.md")
const fallback = "/Users/a1/Projects/easnerbanking/docs/marketing/VOICE-AND-GUARDRAILS.md"
const file = fs.existsSync(source) ? source : fallback
const md = fs.readFileSync(file, "utf8")

const section = (title) => {
  const start = md.indexOf(`## ${title}`)
  if (start < 0) throw new Error(`Section "${title}" not found in ${file}`)
  const rest = md.slice(start + 3)
  const end = rest.search(/\n##+ /)
  return rest.slice(0, end < 0 ? undefined : end)
}
const rows = (text) =>
  text
    .split("\n")
    .filter((l) => l.startsWith("|") && !/^\|[\s|:-]+\|$/.test(l))
    .slice(1)
    .map((l) => l.split("|").slice(1, -1).map((c) => c.trim()))
const plain = (s) => s.replace(/\*\*/g, "").replace(/`/g, "").trim()

// phrase (lower-case, as written in the markdown) → regex source, flags
const BANNED = {
  "instant": ["\\binstant(ly)?\\b", "i"],
  "zero fee": ["\\bzero[- ]fees?\\b", "i"],
  "free transfers": ["\\bfree\\s+transfers?\\b", "i"],
  "easner is a bank": ["\\bEasner\\s+is\\s+a\\s+bank\\b", "i"],
  "fdic insured": ["(?<!not\\s)\\bFDIC[- ]insured\\b", "i"],
  "we hold your keys": ["\\bwe\\s+hold\\s+your\\s+keys\\b", "i"],
  "hsm custody": ["\\bHSM\\s+custody\\b", "i"],
  "ai-powered aml": ["\\bAI[- ]powered\\s+AML\\b", "i"],
  "gdpr-compliant data residency": ["\\bGDPR[- ]compliant\\s+data\\s+residency\\b", "i"],
  "crypto app": ["\\bcrypto\\s+app\\b", "i"],
  "trade crypto": ["\\btrade\\s+crypto(currency)?\\b", "i"],
  "buy bitcoin": ["\\bbuy\\s+bitcoin\\b", "i"],
  "available everywhere": ["\\bavailable\\s+everywhere\\b", "i"],
  "live cards": ["\\blive\\s+cards\\b", "i"],
  "apply for your card now": ["\\bapply\\s+for\\s+your\\s+card\\s+now\\b", "i"],
  "bridge": ["\\bEasner\\s+Bridge\\b|\\bBridge\\s+(account|product|wallet|API)\\b", ""],
  "easner personal": ["\\bEasner\\s+Personal\\b(?!\\s+Banking)", ""],
  "easner tag": ["\\bEasner\\s+tag\\b", "i"],
  // A layout rule, not a phrase a writer types.
  "partner names on product pages": null,
}

const banned = []
for (const [cell, why, instead] of rows(section("Avoid this"))) {
  for (const phrase of plain(cell).split(" / ")) {
    const key = phrase.trim().toLowerCase()
    const known = BANNED[key]
    if (known === null) continue
    if (!known) throw new Error(`Guardrails list "${phrase}" but build-brand-rules.mjs has no pattern for it. Add one.`)
    banned.push({
      id: key.replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
      phrase: phrase.trim(),
      pattern: known[0],
      flags: known[1],
      replacement: plain(instead),
      reason: plain(why),
      severity: "error",
    })
  }
}

// claim (lower-case start) → trigger and satisfied regexes. A claim with its qualifier anywhere in the same
// paragraph passes ("qualify once").
const QUAL = {
  "lower cost vs banks": [
    "\\b(\\d+\\s?%|~\\s?\\d+\\s?%)\\s+(lower|cheaper|less)\\b|\\blower\\s+cost\\b|\\bcheaper\\s+than\\b",
    "\\bup\\s+to\\b[^.]*\\bsupported\\s+corridors?\\b|\\bsupported\\s+corridors?\\b",
  ],
  "stablecoin receive/send": [
    "\\bstablecoins?\\b[^.]*\\b(send|receive|sending|receiving)\\b|\\b(send|receive|sending|receiving)\\b[^.]*\\bstablecoins?\\b",
    "\\bwhere\\s+(enabled|supported)\\b",
  ],
  "african banking (ngn, regional)": ["\\bAfrican\\s+banking\\b|\\bNGN\\s+(account|banking)\\b", "\\bwhere\\s+we\\s+launch\\b"],
  "gbp and other currencies": ["\\bGBP\\s+(account|banking)\\b", "\\bwhere\\s+supported\\b|\\bwhere\\s+enabled\\b"],
  "corporate / personal cards": [
    "\\b(corporate|personal|virtual|business)\\s+cards?\\b|\\bEasner\\s+cards?\\b",
    "\\bwhen\\s+(available|approved)\\b",
  ],
  "wallet send": ["\\bwallet\\s+send\\b|\\bsend\\s+from\\s+(a|your)\\s+wallet\\b", "\\bapproved\\s+corridors?\\b|\\bEasner\\s+Business\\b"],
  "api / agency pricing": ["\\b(API|agency)\\s+pricing\\b", "\\bcontact\\b"],
}

const qualifiers = []
for (const [claim, qualifier] of rows(section("Claims requiring qualifiers"))) {
  const key = plain(claim).toLowerCase()
  const known = QUAL[key]
  if (!known) throw new Error(`Guardrails list claim "${claim}" but build-brand-rules.mjs has no pattern for it. Add one.`)
  qualifiers.push({
    id: key.replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
    claim: plain(claim),
    qualifier: plain(qualifier),
    trigger: known[0],
    satisfied: known[1],
    flags: "i",
    severity: "warning",
  })
}

const out = {
  generatedFrom: "easnerbanking/docs/marketing/VOICE-AND-GUARDRAILS.md",
  banned,
  qualifiers,
  emDash: { pattern: "—", replacement: "–", reason: "No em-dashes in customer-facing copy. Use an en-dash (–).", severity: "warning" },
}
const target = path.resolve(here, "../lib/blog/brand-rules.json")
fs.writeFileSync(target, `${JSON.stringify(out, null, 2)}\n`)
console.log(`✓ ${banned.length} banned phrases, ${qualifiers.length} qualifier rules → ${path.relative(process.cwd(), target)}`)

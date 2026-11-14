import { test } from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { claimCategories, checkClaims, CLAIM_PATTERNS } from "./claims.ts"

const p = (text: string) => ({ type: "paragraph", content: [{ type: "text", text }] })
const doc = (...texts: string[]) => ({ type: "doc", content: texts.map(p) })
const ids = (text: string) => checkClaims({ doc: doc(text) }).matches.map((m) => m.id)

test("fees, rates and yields are flagged", () => {
  assert.ok(ids("Easner has no fees on transfers.").includes("fees-none"))
  assert.ok(ids("We charge a fee of 1.5% on cards.").includes("fees-amount"))
  assert.ok(ids("Free transfers between Easner accounts.").includes("fees-free"))
  assert.ok(ids("The account pays 4% APY.").includes("rates-apy"))
  assert.ok(ids("Your balance can earn 3% interest.").includes("rates-earn"))
  assert.ok(ids("Stablecoin yields keep moving.").includes("yield"))
})

test("FX, insurance, regulatory and competitor claims are flagged", () => {
  assert.ok(ids("Our FX margin is small.").includes("fx-margin"))
  assert.ok(ids("You get the mid-market rate.").includes("fx-mid-market"))
  assert.ok(ids("Deposits are FDIC insured.").includes("insured"))
  assert.ok(ids("Easner is fully licensed in the US.").includes("licensed"))
  assert.ok(ids("Regulated by the relevant authority.").includes("regulated"))
  assert.ok(ids("Cheaper than Wise for most corridors.").includes("competitor-name"))
  assert.ok(ids("Cheaper than Wise for most corridors.").includes("competitor-compare"))
  assert.ok(ids("Easner vs your bank").includes("competitor-compare"))
})

test("plain copy is not flagged", () => {
  for (const text of [
    "Otherwise, here is how a payroll run works.",
    "We shipped a new settings page and a faster invoice list.",
    "Pay suppliers in 80+ countries, typically in minutes to hours.",
    "The team at Easner wrote this guide for finance leads.",
    "Choose a currency, add the recipient, and send.",
  ]) {
    assert.deepEqual(ids(text), [], text)
  }
})

test("title, excerpt and every block are scanned, with the block path", () => {
  const r = checkClaims({ title: "Zero fees for everyone", excerpt: "", doc: doc("Hello.", "Insured deposits.") })
  assert.equal(r.flagged, true)
  const where = r.matches.map((m) => `${m.where}:${m.id}`)
  assert.ok(where.includes("title:fees-none"))
  assert.ok(where.includes("body:insured"))
  assert.deepEqual(r.matches.find((m) => m.id === "insured")?.path, [1])
  assert.deepEqual(claimCategories(r).sort(), ["fees", "insured"])
  assert.equal(checkClaims({ title: "Hello", doc: doc("World") }).flagged, false)
  assert.equal(checkClaims({}).flagged, false)
})

test("patterns avoid constructs that differ between JS and Postgres", () => {
  for (const { id, pattern } of CLAIM_PATTERNS) {
    assert.doesNotThrow(() => new RegExp(pattern, "i"), id)
    assert.ok(!/\(\?<[=!a-z]/.test(pattern), `${id}: no lookbehind or named groups`)
  }
})

test("the JSON equals the rows the migration seeds (one list, two runtimes)", () => {
  const sql = readFileSync(
    fileURLToPath(new URL("../../../supabase/migrations/20261115120000_blog_review_workflow.sql", import.meta.url)),
    "utf8",
  )
  const rows = [...sql.matchAll(/\('([^']+)', '([^']+)', '([^']*)', \$re\$([\s\S]*?)\$re\$\)/g)].map((m) => ({
    id: m[1],
    category: m[2],
    label: m[3],
    pattern: m[4],
  }))
  assert.equal(rows.length, CLAIM_PATTERNS.length)
  assert.deepEqual(rows, CLAIM_PATTERNS.map(({ id, category, label, pattern }) => ({ id, category, label, pattern })))
})

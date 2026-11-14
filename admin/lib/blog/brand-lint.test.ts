import { test } from "node:test"
import assert from "node:assert/strict"
import type { AnyNode } from "@easner/blog-content"
import { lintDoc, lintText } from "./brand-lint.ts"

const errs = (t: string) => lintText(t).filter((i) => i.severity === "error").map((i) => i.rule)
const warns = (t: string) => lintText(t).filter((i) => i.severity === "warning").map((i) => i.rule)

test("banned phrases are errors", () => {
  assert.deepEqual(errs("Send money instantly."), ["instant"])
  assert.deepEqual(errs("Instant transfers"), ["instant"])
  assert.deepEqual(errs("Zero fee, zero-fees and free transfers."), ["zero-fee", "zero-fee", "free-transfers"])
  assert.deepEqual(errs("Easner is a bank"), ["easner-is-a-bank"])
  assert.deepEqual(errs("It is FDIC insured."), ["fdic-insured"])
  assert.deepEqual(errs("Apply for your card now"), ["apply-for-your-card-now"])
  assert.deepEqual(errs("Meet Easner Personal today"), ["easner-personal"])
  assert.deepEqual(errs("Use your Easner tag"), ["easner-tag"])
  assert.deepEqual(errs("Easner Bridge is great"), ["bridge"])
  assert.deepEqual(errs("buy Bitcoin here"), ["buy-bitcoin"])
  assert.deepEqual(errs("Available everywhere"), ["available-everywhere"])
})
test("false positives stay quiet", () => {
  assert.deepEqual(errs("Easner is not a bank and not FDIC insured."), [])
  assert.deepEqual(errs("Easner Personal Banking and Easner Mobile."), [])
  assert.deepEqual(errs("Use your EASETAG."), [])
  assert.deepEqual(errs("A bank account, a bridge between banks, the Brooklyn Bridge."), [])
  assert.deepEqual(errs("Fast, typically minutes to hours. Fees may apply."), [])
  assert.deepEqual(errs("An instance of instantiation."), [])
})
test("match ranges point at the text", () => {
  const [i] = lintText("Pay instantly now")
  assert.equal("Pay instantly now".slice(i.from, i.to), "instantly")
  assert.ok(i.reason && i.suggestion)
})
test("qualifier warnings, qualify once", () => {
  assert.deepEqual(warns("We are 60% cheaper than banks."), ["lower-cost-vs-banks"])
  assert.deepEqual(warns("Up to ~60% lower cost in supported corridors."), [])
  assert.deepEqual(warns("Send stablecoin to anyone."), ["stablecoin-receive-send"])
  assert.deepEqual(warns("Send stablecoin where enabled."), [])
  assert.deepEqual(warns("Order virtual cards today."), ["corporate-personal-cards"])
  assert.deepEqual(warns("Cards, when available. Order virtual cards later."), [])
  assert.deepEqual(warns("Read about stablecoin history."), [])
})
test("em-dash warns", () => {
  const w = lintText("Fast — and clear")
  assert.equal(w.length, 1)
  assert.equal(w[0].rule, "em-dash")
  assert.equal(w[0].severity, "warning")
  assert.equal(lintText("Fast – and clear").length, 0)
})
test("lintDoc gives paths, reads attrs, skips code", () => {
  const doc: AnyNode = {
    type: "doc",
    content: [
      { type: "paragraph", content: [{ type: "text", text: "Fine." }] },
      { type: "bulletList", content: [{ type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Instant payouts" }] }] }] },
      { type: "codeBlock", content: [{ type: "text", text: "instant" }] },
      { type: "faq", content: [{ type: "faqItem", attrs: { question: "Is it zero fee?" }, content: [{ type: "paragraph", content: [{ type: "text", text: "No." }] }] }] },
    ],
  }
  const issues = lintDoc(doc)
  assert.deepEqual(issues.map((i) => [i.rule, i.path]), [["instant", [1, 0, 0]], ["zero-fee", [3, 0]]])
})

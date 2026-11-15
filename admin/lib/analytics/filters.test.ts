import { test } from "node:test"
import assert from "node:assert/strict"
import { activeDimension, hasBreakdowns, nextFilterPatch, readFilters } from "./filters.ts"

const none = { country: "", device: "", source: "", page: "" }

test("only the whole site, the blog and blog posts have breakdown rows", () => {
  assert.ok(hasBreakdowns("*") && hasBreakdowns("/blog/*") && hasBreakdowns("/blog/how-payroll-works"))
  assert.ok(!hasBreakdowns("/pricing") && !hasBreakdowns("/blog"))
})

test("country, device and source narrow one at a time", () => {
  assert.deepEqual(nextFilterPatch({ ...none, country: "NG" }, "device", "mobile"), { device: "mobile", country: null, source: null })
  assert.deepEqual(nextFilterPatch({ ...none, country: "NG" }, "country", ""), { country: null })
  assert.deepEqual(activeDimension({ ...none, device: "mobile" }), { dimension: "device", value: "mobile" })
  assert.equal(activeDimension(none), null)
})

test("a page without breakdown rows stands alone", () => {
  assert.deepEqual(nextFilterPatch({ ...none, country: "NG" }, "page", "/pricing"), { page: "/pricing", country: null, device: null, source: null })
  assert.deepEqual(nextFilterPatch({ ...none, country: "NG" }, "page", "/blog/a-post"), { page: "/blog/a-post" })
  assert.deepEqual(nextFilterPatch({ ...none, page: "/pricing" }, "country", "NG"), { country: "NG", device: null, source: null, page: null })
})

test("filters read from the URL", () => {
  const q = new URLSearchParams("country=NG&page=/pricing")
  assert.deepEqual(readFilters((k) => q.get(k)), { country: "NG", device: "", source: "", page: "/pricing" })
})

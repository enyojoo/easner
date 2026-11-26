import assert from "node:assert/strict"
import test from "node:test"
import { attributionFromVisit, attributionProperties } from "./attribution.ts"

const landing = {
  search: "?utm_source=google&utm_medium=cpc&utm_campaign=spring&utm_content=hero&gclid=abc",
  referrer: "https://www.google.com/",
  href: "https://www.easner.com/?utm_source=google&utm_medium=cpc&utm_campaign=spring&utm_content=hero&gclid=abc",
  pathname: "/",
  previous: null,
}

test("landing visit keeps every UTM and the referrer", () => {
  const attribution = attributionFromVisit(landing)
  assert.equal(attribution.utm_source, "google")
  assert.equal(attribution.utm_medium, "cpc")
  assert.equal(attribution.utm_campaign, "spring")
  assert.equal(attribution.utm_content, "hero")
  assert.equal(attribution.gclid, "abc")
  assert.equal(attribution.session_referring_domain, "google.com")
  assert.equal(attribution.acquisition_channel, "paid")
  assert.equal(attribution.session_landing_path, "/")
})

test("later pages keep the landing UTMs when the URL has none", () => {
  const first = attributionFromVisit(landing)
  const next = attributionFromVisit({
    search: "",
    referrer: "https://www.easner.com/",
    href: "https://www.easner.com/pricing",
    pathname: "/pricing",
    previous: first,
  })
  assert.equal(next.utm_campaign, "spring")
  assert.equal(next.utm_source, "google")
  assert.equal(next.session_landing_path, "/")
  assert.equal(next.session_referring_domain, "google.com")
  assert.equal(next.acquisition_channel, "paid")
  assert.equal(attributionProperties(next).utm_campaign, "spring")
})

test("a new campaign link replaces the previous UTMs and keeps the original landing", () => {
  const first = attributionFromVisit(landing)
  const next = attributionFromVisit({
    search: "?utm_source=newsletter&utm_medium=email&utm_campaign=june",
    referrer: "",
    href: "https://www.easner.com/business?utm_source=newsletter&utm_medium=email&utm_campaign=june",
    pathname: "/business",
    previous: first,
  })
  assert.equal(next.utm_source, "newsletter")
  assert.equal(next.utm_campaign, "june")
  assert.equal(next.utm_content, undefined)
  assert.equal(next.gclid, undefined)
  assert.equal(next.session_landing_path, "/")
  assert.equal(next.acquisition_channel, "email")
})

test("a click id without UTMs is recorded as paid", () => {
  const attribution = attributionFromVisit({
    search: "?gclid=abc",
    referrer: "https://www.google.com/",
    href: "https://www.easner.com/?gclid=abc",
    pathname: "/",
    previous: null,
  })
  assert.equal(attribution.utm_source, "google")
  assert.equal(attribution.utm_medium, "cpc")
  assert.equal(attribution.acquisition_channel, "paid")
})

test("a direct visit has no UTMs", () => {
  const attribution = attributionFromVisit({
    search: "",
    referrer: "",
    href: "https://www.easner.com/about",
    pathname: "/about",
    previous: null,
  })
  assert.equal(attribution.utm_source, undefined)
  assert.equal(attribution.acquisition_channel, "direct")
  assert.equal(attribution.session_referring_domain, "$direct")
  assert.equal("utm_source" in attributionProperties(attribution), false)
})

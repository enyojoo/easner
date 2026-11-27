import assert from "node:assert/strict"
import test from "node:test"
import { buildLlmsTxt } from "./llms-txt.ts"

function section(text: string, title: string) {
  const block = text.split(/^## /m).find((part) => part.startsWith(`${title}\n`))
  assert.ok(block, `missing section ${title}`)
  return block
}

test("llms.txt routes each product and the payout countries", () => {
  const text = buildLlmsTxt()
  for (const path of [
    "/personal",
    "/business",
    "/checkout",
    "/payment-links",
    "/invoicing",
    "/payroll",
    "/stablecoin",
    "/cards",
    "/connect",
    "/white-label",
    "/developers",
  ]) {
    assert.ok(text.includes(`https://www.easner.com${path}`), path)
  }

  const whiteLabel = section(text, "White-label")
  assert.match(whiteLabel, /What is Easner White-label\?/)
  assert.match(whiteLabel, /Can I launch a white-label remittance app\?/)
  assert.equal(text.includes("Agency Model"), false)

  const connect = section(text, "Connect")
  assert.match(connect, /marketplace sellers/)
  const useCases = section(text, "Use cases")
  assert.match(useCases, /marketplace sellers/)
  assert.ok(useCases.includes("https://www.easner.com/connect/marketplace-seller-payouts"))
  assert.ok(useCases.includes("https://www.easner.com/business/pay-overseas-suppliers"))
  const comparisons = section(text, "Comparisons")
  const withoutConnect = text.replace(connect, "").replace(useCases, "").replace(comparisons, "")
  assert.doesNotMatch(withoutConnect, /marketplace sellers/)

  for (const slug of [
    "easner-connect-vs-stripe-connect",
    "easner-business-vs-wise-business",
    "easner-connect-vs-paypal-payouts",
  ]) {
    assert.ok(comparisons.includes(`https://www.easner.com/compare/${slug}`), slug)
  }

  const answers = section(text, "Answers: countries and tax forms")
  assert.match(answers, /W-8BEN-E/)
  assert.doesNotMatch(text.replace(answers, ""), /W-8BEN-E/)

  const payroll = section(text, "Payroll")
  assert.match(payroll, /W-4/)
  assert.match(payroll, /1099-NEC/)
  const withoutPayroll = text.replace(payroll, "")
  assert.doesNotMatch(withoutPayroll, /W-4/)
  assert.doesNotMatch(withoutPayroll, /1099-NEC/)

  const developers = section(text, "Developers")
  assert.match(developers, /embed accounts and payouts/)
  assert.match(developers, /https:\/\/docs\.easner\.com\//)
  assert.doesNotMatch(text.replace(developers, ""), /embed accounts and payouts/)
  assert.match(developers, /What is the Easner API\?/)
  assert.match(developers, /Is there an embedded payout API\?/)
  assert.match(developers, /There is no separate SDK/)

  assert.match(section(text, "Invoicing"), /Can I send a stablecoin invoice\?/)
  assert.match(section(text, "Stablecoin"), /Can I send a stablecoin invoice\?/)
  assert.match(section(text, "Payroll"), /Can I pay contractors by direct deposit\?/)
  assert.match(section(text, "Connect"), /Can I pay contractors by direct deposit\?/)

  assert.match(section(text, "Personal Banking"), /What is Easner Personal Banking\?/)
  assert.match(section(text, "Business Banking"), /What is Easner Business Banking\?/)

  const nigeria = text.split("How do I send money from the United States to Nigeria?")[1] ?? ""
  assert.match(nigeria, /NGN/)
  assert.match(nigeria, /bank only/)
  assert.doesNotMatch(nigeria.slice(0, 400), /mobile money/)

  for (const country of ["Mexico", "Brazil", "India", "the Philippines", "Germany"]) {
    assert.ok(text.includes(`How do I send money from the United States to ${country}?`), country)
  }
  assert.ok(text.includes("How do I send money from Nigeria to the United States?"))

  const kenya = text.split("How do I send money from Kenya to the United States?")[1] ?? ""
  assert.match(kenya, /payout/)
  assert.match(kenya, /cannot open/)

  assert.equal(text.split("How do I send money from the United States to Nigeria?").length - 1, 1)
  assert.ok(text.includes("How do I pay someone in Nigeria with Easner Connect?"))
  assert.match(answers, /cash out in NGN by bank only/)
  assert.match(answers, /The Easner app is not available in China/)
  assert.ok(text.includes("How do I pay a contractor in Nigeria with Easner Payroll?"))
  assert.ok(text.includes("How do I send a payout to Nigeria with the Easner API?"))
  assert.ok(text.includes("How do I offer a payout to Nigeria under my own brand?"))
  assert.equal(text.includes("How do I send money from the United States to China?"), false)
  assert.equal(text.includes("How do I send money from the United States to Pakistan?"), false)
  assert.equal(text.includes("How do I pay a supplier in China from the United States?"), false)
  assert.ok(text.includes("80+ countries"))
})

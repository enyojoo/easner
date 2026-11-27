/**
 * "Pay contractors in [country]" pages, one per payout country that has a local guide in ../corridor-guides.
 * The shared spine (key facts, steps, FAQ) is built here; what differs by country is the guide.
 * Currency and rail come from corridors.ts, the same source /answers and llms.txt use.
 * They sit under Business Banking and are listed with the use-case pages (sitemap, llms.txt, breadcrumbs).
 */
import { corridorGuides, type CorridorGuide } from "../corridor-guides"
import { EUR_PAYOUT_COUNTRIES, businessPayFaq, payoutCountry, spoken } from "../corridors"
import type { CardItem, FaqItem, ProductPageContent } from "../types"
import type { UseCasePage } from "./use-cases"
import { businessContent } from "./business"

const REVIEWED = "2026-11-27"

const businessFaqs = businessContent.faq ?? []

function pick(question: string): FaqItem {
  const found = businessFaqs.find((item) => item.question === question)
  if (!found) throw new Error(`Corridor page needs the Business FAQ "${question}", which is missing`)
  return found
}

const capitalise = (text: string) => text.charAt(0).toUpperCase() + text.slice(1)
const pathFor = (guide: Pick<CorridorGuide, "slug">) => `/business/${guide.slug}`
const placeOf = (guide: CorridorGuide) => guide.place ?? spoken(guide.country)

/** The euro countries on one page, because they share the same details and a page per country would repeat itself. */
const europeFaq: FaqItem = {
  question: "Which European countries can I pay in euros?",
  answer: `From Easner Business you can pay euros by bank to ${EUR_PAYOUT_COUNTRIES.join(", ")}. This is not every European country. The United Kingdom is separate: the contractor receives GBP by bank. Fees and the exchange rate are shown before you confirm, including what the recipient gets. Transfers typically arrive in minutes to hours, same-day where supported.`,
  links: [{ label: "Business Banking", href: "/business" }],
}

function buildPage(guide: CorridorGuide, all: CorridorGuide[]): UseCasePage {
  const country = payoutCountry(guide.country)
  if (!country) throw new Error(`Corridor guide for "${guide.country}" has no payout country in corridors.ts`)
  const place = placeOf(guide)
  const slot = `mkt-corridor-${guide.code.toLowerCase()}`
  const received = `${guide.currencyName} ${guide.delivery}`
  const others = all.filter((other) => other.slug !== guide.slug)
  const hubPath = "/business/pay-overseas-suppliers"

  const content: ProductPageContent = {
    metadata: {
      title: `Pay Contractors in ${place} | ${guide.titleTail}`,
      description: `Pay contractors in ${place} from your Easner Business balance. They receive ${country.currency} ${guide.delivery}. Rate and fees are shown first.`,
      keywords: guide.keywords,
    },
    keyFacts: [
      { label: "Contractor receives", value: `${capitalise(guide.currencyName)} (${country.currency}), ${guide.delivery}` },
      { label: "You pay from", value: "US dollars, from your Easner Business balance" },
      { label: "They need to give you", value: guide.needs },
      { label: "Their Easner account", value: "Not needed" },
      { label: "Typically arrives", value: "In minutes to hours, same-day where supported" },
      { label: "Time difference", value: guide.timeNote.fact },
      { label: "Before you confirm", value: "The rate, the fees and what they receive are shown first" },
      { label: "Pricing", value: "See plans and fees", href: "/pricing" },
    ],
    lastReviewed: REVIEWED,
    hero: {
      h1: `Pay contractors in ${place} from one balance`,
      subhead: `Pay your contractors and suppliers in ${place} from your Easner Business balance. They receive ${received}, and the rate and fees are shown before you confirm.`,
      visualSlot: slot,
      altText: `Easner Business payout screen for a contractor in ${place}, showing the recipient and the ${country.currency} they receive`,
      ctas: [
        { ...businessContent.hero.ctas[0], analyticsLocation: `business_${guide.slug}_hero` },
        { label: "Other countries", href: hubPath, analyticsLocation: `business_${guide.slug}_hero_countries` },
      ],
    },
    problem: { headline: `Paying people in ${place}`, body: guide.intro },
    integrationStepsHeadline: "How it works",
    integrationSteps: [
      { title: "Open Easner Business", description: "Start on the web and create a company account." },
      {
        title: "Verify your business",
        description:
          "Provide your business registration details, the people who own and control it, and identity verification for each owner.",
      },
      { title: "Add your contractor", description: guide.addStep },
      {
        title: "Pay from your balance",
        description: `Choose the amount. You see the rate, the fees and what they receive in ${country.currency} before you confirm, and each payment carries its own status.`,
      },
    ],
    extraSections: [
      {
        headline: `${guide.asks.headline}, in ${place}`,
        body: guide.asks.body,
        bullets: guide.asks.bullets,
        visualSlot: `${slot}-recipient`,
        altText: `Add recipient form with the ${place} details Easner asks for`,
      },
    ],
    useCasesHeadline: `Good to know when paying in ${place}`,
    useCases: [
      ...guide.goodToKnow,
      { title: guide.timeNote.title, description: guide.timeNote.description },
    ],
    useCaseLinks: [
      ...others.map((other) => ({ label: `Pay contractors in ${placeOf(other)}`, href: pathFor(other) })),
      { label: "Pay suppliers abroad", href: hubPath },
    ],
    segmentsHeadline: `Who businesses typically pay in ${place}`,
    segments: guide.payees,
    definition: {
      term: `Paying contractors in ${place} with Easner Business`,
      question: `How do I pay a contractor in ${place} with Easner Business?`,
      answer: `Open an Easner Business account, verify the business, add your contractor and pay from your balance. In ${place}, your contractor receives ${received}, and they do not need an Easner account. The rate, the fees and what they receive are shown before you confirm.`,
    },
    faq: [
      ...guide.faq,
      guide.region ? europeFaq : businessPayFaq(guide.country),
      pick("What do I need to verify my business?"),
      pick("Who can open an Easner Business account?"),
    ],
    ctaBand: businessContent.ctaBand,
    complianceNote: businessContent.complianceNote,
  }

  return { parent: "business", slug: guide.slug, linkLabel: `Pay contractors in ${place}`, content }
}

export const corridorPages: UseCasePage[] = corridorGuides.map((guide) => buildPage(guide, corridorGuides))

/** One card per country, for the "pay suppliers abroad" page that lists them. */
export const corridorCards: CardItem[] = corridorGuides.map((guide) => ({
  title: guide.label ?? guide.country,
  description: guide.cardLine,
  link: pathFor(guide),
}))

export const corridorLinks = corridorGuides.map((guide) => ({
  label: `Pay contractors in ${placeOf(guide)}`,
  href: pathFor(guide),
}))

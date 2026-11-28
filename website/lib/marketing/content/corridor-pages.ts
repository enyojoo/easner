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


const cardFor = (guide: CorridorGuide): CardItem => ({
  title: guide.label ?? guide.country,
  description: guide.cardLine,
  flag: guide.code,
  link: pathFor(guide),
})

/**
 * The pages a country page points to. Every page links to the same few neighbours it would have anyway, but each
 * page gets a different window of its region, so links spread across the set instead of piling onto the first few.
 * The Europe page lists every euro-payout country, and each euro country links back to it.
 */
function relatedFor(guide: CorridorGuide, all: CorridorGuide[]): CorridorGuide[] {
  const area = all.filter((other) => other.area === guide.area && other.slug !== guide.slug)
  if (guide.region) return area.filter((other) => other.country !== "United Kingdom")
  if (guide.area !== "Europe") {
    const own = all.filter((other) => other.area === guide.area).findIndex((other) => other.slug === guide.slug)
    return Array.from({ length: Math.min(8, area.length) }, (_, i) => area[(own + i) % area.length])
  }
  const europe = all.find((other) => other.region)
  const countries = area.filter((other) => !other.region && other.country !== "United Kingdom")
  const start = Math.max(0, all.filter((other) => other.area === "Europe").findIndex((other) => other.slug === guide.slug))
  const window = Array.from({ length: Math.min(7, countries.length) }, (_, i) => countries[(start + i) % countries.length])
  return [...(europe && europe.slug !== guide.slug ? [europe] : []), ...window]
}

/** One closing line per page, picked from a few true ones, so the pages do not all end on the same sentence. */
const CLOSERS = [
  "It works the same way in every country, from one dashboard.",
  "Each payment carries its own status, so you can follow it from your dashboard.",
  "The rate and fees are shown before you send.",
]
const closerFor = (slug: string) => CLOSERS[[...slug].reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % CLOSERS.length]

/**
 * The value prop on every page, in place of the old time-zone note: what is good about the way the money reaches this
 * country. Each one is about the rail the contractor is paid through, and only says what is true of that rail and of how
 * Easner works (the contractor needs no Easner account, you pay from one balance, the payee gets local currency).
 */
function valueCard(guide: CorridorGuide, place: string, currency: string): CardItem {
  const closer = closerFor(guide.slug)
  const local = currency === "USD" ? "US dollars" : guide.currencyName
  switch (guide.deliveryLabel) {
    case "Bank transfer (SEPA)":
      return {
        title: "Paid by SEPA, straight to their IBAN",
        description: guide.region
          ? `Easner sends euros by SEPA bank transfer to an IBAN in any of ${EUR_PAYOUT_COUNTRIES.length} countries. You send from your dollar balance and there is no international wire to arrange. ${closer}`
          : `Easner sends euros by SEPA bank transfer straight to your contractor's IBAN in ${place}. You send from your dollar balance and there is no international wire to arrange. ${closer}`,
      }
    case "Bank transfer (Faster Payments)":
      return {
        title: "Paid over the UK's own network",
        description: `Your contractor in ${place} is paid over Faster Payments, the network UK banks use for bank transfers, straight to their sort code and account number. ${closer}`,
      }
    case "RTP, FedNow or ACH":
      return {
        title: "Paid instantly or by ACH, in dollars",
        description: `Your contractor's US bank account can be paid over RTP or FedNow, the instant networks, or by ACH, depending on what their bank supports. They are paid in dollars with no foreign account to set up. ${closer}`,
      }
    case "Bank transfer (SPEI)":
      return {
        title: "Paid over SPEI, Mexico's own network",
        description: `Your contractor receives pesos over SPEI, the network Mexican banks use for transfers, straight to their CLABE. They need no foreign account and no Easner account. ${closer}`,
      }
    case "Pix":
      return {
        title: "Paid through Pix, like any local payment",
        description: `Your contractor receives reais through Pix, Brazil's instant payment system, so the money arrives the way a payment from a Brazilian customer would. They need no foreign account. ${closer}`,
      }
    case "Bre-B":
      return {
        title: "Paid through Colombia's instant system",
        description: `Your contractor receives pesos through Bre-B, Colombia's instant payment system, using a key linked to their own bank account. They need no foreign account. ${closer}`,
      }
    case "Mobile money":
      return {
        title: "Paid straight to their phone",
        description: `Your contractor receives ${local} in their mobile money wallet, so they do not need a bank account to be paid, and they do not need an Easner account either. ${closer}`,
      }
    case "Bank or mobile money":
      return {
        title: "Paid the way your contractor prefers",
        description: `Your contractor in ${place} chooses what suits them, a bank account or a mobile money wallet. ${closer}`,
      }
    default:
      return {
        title: "Paid locally, with no foreign account",
        description:
          currency === "USD"
            ? `Your contractor receives US dollars in their own bank account in ${place}, and they do not need an Easner account to be paid. ${closer}`
            : `Your contractor receives ${local} in their own bank account in ${place}. They do not need an Easner account or a dollar account to be paid. ${closer}`,
      }
  }
}

const countryOf = (guide: CorridorGuide) => ({ name: guide.label ?? guide.country, code: guide.code })

function buildPage(guide: CorridorGuide, all: CorridorGuide[]): UseCasePage {
  const country = payoutCountry(guide.country)
  if (!country) throw new Error(`Corridor guide for "${guide.country}" has no payout country in corridors.ts`)
  const place = placeOf(guide)
  const slot = `mkt-corridor-${guide.code.toLowerCase()}`
  const received = `${guide.currencyName} ${guide.delivery}`
  const hubPath = "/business/pay-overseas-suppliers"
  const related = relatedFor(guide, all)

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
      { label: "Track it", value: "Each payment carries its own status in your dashboard" },
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
      valueCard(guide, place, country.currency),
    ],
    relatedCards: {
      headline: guide.region ? "Pay contractors in a European country" : "Pay contractors in other countries",
      items: related.map(cardFor),
      footerLinks: [{ label: "See every payout country", href: hubPath }],
    },
    segmentsHeadline: `Who businesses typically pay in ${place}`,
    segments: guide.payees,
    definition: {
      term: `Paying contractors in ${place} with Easner Business`,
      question: `How do I pay a contractor in ${place} with Easner Business?`,
      answer: `Open an Easner Business account, verify the business, add your contractor and pay from your balance. In ${place}, your contractor receives ${received}, and they do not need an Easner account. The rate, the fees and what they receive are shown before you confirm.`,
    },
    faq: [
      ...guide.faq,
      ...(guide.region ? [europeFaq] : guide.noCountryFaq ? [] : [businessPayFaq(guide.country)]),
      pick("What do I need to verify my business?"),
      pick("Who can open an Easner Business account?"),
    ],
    ctaBand: businessContent.ctaBand,
    complianceNote: businessContent.complianceNote,
  }

  // The Europe page covers every euro-payout country; every other page covers its own country.
  const serves = guide.region
    ? all.filter((other) => other.area === "Europe" && !other.region && other.country !== "United Kingdom").map(countryOf)
    : [countryOf(guide)]

  return { parent: "business", slug: guide.slug, linkLabel: `Pay contractors in ${place}`, serves, content }
}

export const corridorPages: UseCasePage[] = corridorGuides.map((guide) => buildPage(guide, corridorGuides))

/** The hub: every country, grouped by region. */
const AREAS: { area: CorridorGuide["area"]; headline: string; subhead?: string }[] = [
  {
    area: "Americas",
    headline: "Pay contractors in the Americas",
    subhead: "What your contractor needs to give you, and what is good to know, country by country.",
  },
  { area: "Africa", headline: "Pay contractors in Africa" },
  { area: "Europe", headline: "Pay contractors in Europe and the UK" },
  { area: "Asia", headline: "Pay contractors in Asia" },
]

export const corridorGroups = AREAS.map(({ area, headline, subhead }) => ({
  headline,
  subhead,
  columns: 4 as const,
  items: corridorGuides.filter((guide) => guide.area === area).map(cardFor),
}))

const pathByPlace = new Map(corridorGuides.filter((guide) => !guide.region).map((guide) => [spoken(guide.country), pathFor(guide)]))

/** The page for a country as it is named in a sentence ("the Philippines"), or undefined if it has none. */
export const corridorPathForPlace = (place: string) => pathByPlace.get(place)

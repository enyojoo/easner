import type { FaqItem } from "./types"
import {
  EASNER_CANONICAL_DEFINITION,
  EASNER_ONE_LINE_THESIS,
  BRAND_BASE_URL,
} from "./constants"

const SITE_URL = "https://www.easner.com"
const LOGO_URL = `${BRAND_BASE_URL}/Easner%20Logo.svg`

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Easner",
    legalName: "Easner Group, Inc.",
    url: SITE_URL,
    logo: LOGO_URL,
    description: EASNER_CANONICAL_DEFINITION,
    sameAs: [
      "https://x.com/easnerbanking",
      "https://www.linkedin.com/company/easner/",
    ],
    slogan: EASNER_ONE_LINE_THESIS,
  }
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Easner",
    url: SITE_URL,
    description: EASNER_CANONICAL_DEFINITION,
    publisher: {
      "@type": "Organization",
      name: "Easner",
      url: SITE_URL,
    },
  }
}

/** Sender-side rails (US, EU, UK) named in the canonical definition. */
export const GLOBAL_AREA_SERVED = ["US", "EU", "GB"]

/**
 * Full live payout-corridor footprint (ISO 3166-1 alpha-2), sourced from the Office
 * payout_corridors admin panel (confirmed 2026-09-05). This is intentionally broader than
 * EASNER_SUPPORTED_LOCAL_MARKETS, which names only the handful of markets featured in
 * visible page copy — this list backs schema.org areaServed only (not rendered on-page),
 * so it can and should track the real, current corridor footprint. Update when Office
 * corridor coverage changes materially.
 */
export const CORRIDOR_AREA_SERVED = [
  // Sender rails
  "US", "GB",
  // Europe / EEA
  "AD", "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR", "HU", "IS",
  "IE", "IT", "LV", "LI", "LT", "LU", "MT", "MC", "NL", "NO", "PL", "PT", "RO", "SM", "SK",
  "SI", "ES", "SE", "CH", "VA",
  // North America
  "CA",
  // Africa
  "BW", "CM", "CG", "CI", "CD", "EG", "ET", "GA", "GH", "KE", "MW", "NG", "RW", "SN", "ZA",
  "TZ", "UG", "ZM",
  // Middle East
  "IL", "AE",
  // Latin America / Caribbean
  "AR", "BR", "CO", "EC", "SV", "GT", "HT", "JM", "MX", "PE",
  // Asia-Pacific / South Asia
  "BD", "KH", "CN", "HK", "IN", "ID", "MY", "PK", "PH", "SG", "LK", "TH", "VN",
]

interface FinancialServiceInput {
  name: string
  description: string
  path: string
  serviceType: string
  areaServed?: string[]
}

export function financialServiceJsonLd({ name, description, path, serviceType, areaServed = GLOBAL_AREA_SERVED }: FinancialServiceInput) {
  return {
    "@context": "https://schema.org",
    "@type": "FinancialService",
    name,
    description,
    url: `${SITE_URL}${path}`,
    serviceType,
    areaServed,
    provider: {
      "@type": "Organization",
      name: "Easner",
      url: SITE_URL,
    },
  }
}

interface BreadcrumbSegment {
  name: string
  path: string
}

export function breadcrumbJsonLd(segments: BreadcrumbSegment[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: segments.map((segment, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: segment.name,
      item: `${SITE_URL}${segment.path}`,
    })),
  }
}

export function faqPageJsonLd(items: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  }
}

export function jsonLdScript(data: Record<string, unknown> | Record<string, unknown>[]) {
  return {
    __html: JSON.stringify(data),
  }
}

import type { FaqItem } from "./types"
import {
  EASNER_CANONICAL_DEFINITION,
  EASNER_ONE_LINE_THESIS,
  BRAND_BASE_URL,
  CONTACT_EMAIL,
  SUPPORT_EMAIL,
  CONTACT_PATH,
} from "./constants"

const SITE_URL = "https://www.easner.com"
const LOGO_URL = `${BRAND_BASE_URL}/Easner%20Logo.svg`

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
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
    foundingDate: "2025",
    /** Founders as named on /about – helps answer engines resolve the Easner entity. */
    founder: [
      { "@type": "Person", name: "Christian Levan", jobTitle: "Co-founder & CEO" },
      { "@type": "Person", name: "Enyo Sam", jobTitle: "Founder & CTO" },
    ],
    /** Registered address as published in the Privacy Policy. */
    address: {
      "@type": "PostalAddress",
      streetAddress: "584 Castro St, Suite 4092",
      addressLocality: "San Francisco",
      addressRegion: "CA",
      postalCode: "94114",
      addressCountry: "US",
    },
    contactPoint: [
      { "@type": "ContactPoint", contactType: "sales", email: CONTACT_EMAIL, url: `${SITE_URL}${CONTACT_PATH}`, availableLanguage: "en" },
      { "@type": "ContactPoint", contactType: "customer support", email: SUPPORT_EMAIL, availableLanguage: "en" },
    ],
  }
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: "Easner",
    url: SITE_URL,
    description: EASNER_CANONICAL_DEFINITION,
    publisher: {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
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
 * visible page copy. The schema builder narrows this list to those featured markets
 * so structured data matches the page. Update when Office corridor coverage changes.
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

interface MobileApplicationInput {
  name: string
  description: string
  path: string
  downloadUrls: string[]
}

/**
 * Easner Mobile as a MobileApplication entity. Intentionally omits `offers` and
 * `aggregateRating`: neither store price nor review scores are verified here, and
 * inventing either would breach Google's structured-data policies. Adding a verified
 * `offers` block later is what makes this eligible for app rich results.
 */
export function mobileApplicationJsonLd({ name, description, path, downloadUrls }: MobileApplicationInput) {
  return {
    "@context": "https://schema.org",
    "@type": "MobileApplication",
    name,
    description,
    url: `${SITE_URL}${path}`,
    applicationCategory: "FinanceApplication",
    operatingSystem: "iOS, Android",
    downloadUrl: downloadUrls,
    installUrl: `${SITE_URL}${path}`,
    publisher: { "@id": `${SITE_URL}/#organization` },
  }
}

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
    "@type": "Service",
    "@id": `${SITE_URL}${path}#service`,
    name,
    description,
    url: `${SITE_URL}${path}`,
    serviceType,
    // Describe the markets featured in visible copy. Payment coverage is not
    // unconditional eligibility for every account or product.
    areaServed: areaServed
      .filter((name) => ["US", "GB", "EU", "NG", "MX", "PH", "IN", "CN"].includes(name))
      .map((name) => ({ "@type": name === "EU" ? "AdministrativeArea" : "Country", name: name === "EU" ? "European Union" : name })),
    provider: {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
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
    __html: JSON.stringify(data).replace(/</g, "\\u003c"),
  }
}

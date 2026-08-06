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

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

interface FinancialServiceInput {
  name: string
  description: string
  path: string
  serviceType: string
}

export function financialServiceJsonLd({ name, description, path, serviceType }: FinancialServiceInput) {
  return {
    "@context": "https://schema.org",
    "@type": "FinancialService",
    name,
    description,
    url: `${SITE_URL}${path}`,
    serviceType,
    areaServed: ["US", "EU", "GB"],
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

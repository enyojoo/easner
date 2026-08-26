import { posthog } from "@/lib/posthog"
import { isBusinessEasnerUrl } from "./business-signup-url"
import { isPersonalEasnerUrl } from "./personal-app-url"

export type CtaDestinationType =
  | "internal"
  | "external"
  | "business_signup"
  | "personal_app"
  | "download"
  | "dialog"
  | "mailto"
  | "chat"
  | "anchor"

const PAGE_NAMES: Record<string, string> = {
  "/": "home",
  "/about": "about",
  "/personal": "personal",
  "/business": "business",
  "/cards": "cards",
  "/invoicing": "invoicing",
  "/stablecoin": "stablecoin",
  "/partners": "partners",
  "/developers": "developers",
  "/contact": "contact",
  "/app": "download",
  "/compliance": "compliance",
  "/privacy": "privacy",
  "/terms": "terms",
  "/access": "access",
  "/pricing": "pricing",
}

export function getMarketingPageName(pathname: string): string {
  if (PAGE_NAMES[pathname]) return PAGE_NAMES[pathname]
  const blogMatch = pathname.match(/^\/blog\/([^/]+)/)
  if (blogMatch) return `blog:${blogMatch[1]}`
  return pathname.replace(/^\//, "") || "home"
}

export function getCurrentPageContext(): { page_path: string; page_name: string } {
  if (typeof window === "undefined") {
    return { page_path: "", page_name: "unknown" }
  }
  const page_path = window.location.pathname
  return { page_path, page_name: getMarketingPageName(page_path) }
}

export function inferDestinationType(
  href: string,
  options?: { external?: boolean; action?: string }
): CtaDestinationType {
  if (options?.action === "open-account") return "dialog"
  if (href.startsWith("mailto:")) return "mailto"
  if (href.startsWith("#")) return "anchor"
  if (isBusinessEasnerUrl(href)) return "business_signup"
  if (isPersonalEasnerUrl(href)) return "personal_app"
  if (href.includes("/app") || href.includes("apps.apple.com") || href.includes("play.google.com")) {
    return "download"
  }
  if (options?.external) return "external"
  return "internal"
}

export function captureCtaClicked(properties: {
  cta_location: string
  cta_label?: string
  destination: string
  destination_type?: CtaDestinationType
  page_path?: string
  page_name?: string
}) {
  if (typeof window === "undefined") return

  const pageContext = getCurrentPageContext()
  posthog.capture("cta_clicked", {
    ...pageContext,
    ...properties,
    page_path: properties.page_path ?? pageContext.page_path,
    page_name: properties.page_name ?? pageContext.page_name,
  })
}

export function captureMarketingPageViewed(pathname: string) {
  if (typeof window === "undefined") return

  const page_name = getMarketingPageName(pathname)
  posthog.capture("marketing_page_viewed", {
    page_path: pathname,
    page_name,
    $current_url: window.location.href,
  })

  if (pathname === "/pricing" || pathname.startsWith("/pricing/")) {
    posthog.capture("pricing_page_viewed", { page_path: pathname, page_name })
  }

  const blogMatch = pathname.match(/^\/blog\/([^/]+)/)
  if (blogMatch) {
    posthog.capture("blog_post_viewed", { slug: blogMatch[1], page_path: pathname })
  }
}

export function capturePersonaTabSelected(personaId: string, personaLabel: string) {
  if (typeof window === "undefined") return
  posthog.capture("persona_tab_selected", {
    persona_id: personaId,
    persona_label: personaLabel,
    ...getCurrentPageContext(),
  })
}

export function captureNavClick(label: string, href: string) {
  captureCtaClicked({
    cta_location: `nav_${slugify(label)}`,
    cta_label: label,
    destination: href,
    destination_type: inferDestinationType(href),
  })
}

export function captureSupportChatOpened(location: string) {
  if (typeof window === "undefined") return
  posthog.capture("support_chat_opened", {
    cta_location: location,
    ...getCurrentPageContext(),
  })
  captureCtaClicked({
    cta_location: location,
    cta_label: "Support chat",
    destination: "intercom",
    destination_type: "chat",
  })
}

export function captureFaqExpanded(question: string, index: number) {
  if (typeof window === "undefined") return
  const pageContext = getCurrentPageContext()
  posthog.capture("faq_expanded", {
    ...pageContext,
    faq_location: `${pageContext.page_name}_faq`,
    question,
    question_index: index,
  })
}

export function captureBookingCompleted(properties: {
  uid?: string
  title?: string
  startTime?: string
  eventTypeId?: number | null
}) {
  if (typeof window === "undefined") return
  posthog.capture("booking_completed", {
    ...getCurrentPageContext(),
    cta_location: "contact_booking",
    ...properties,
  })
  captureCtaClicked({
    cta_location: "contact_booking_completed",
    cta_label: "Book a call",
    destination: "cal.com",
    destination_type: "external",
  })
}

export function captureFormSubmitted(
  formName: string,
  properties?: Record<string, string | number | boolean | null>
) {
  if (typeof window === "undefined") return
  posthog.capture("form_submitted", {
    form_name: formName,
    ...getCurrentPageContext(),
    ...properties,
  })
}

export function trackLinkClick(
  analyticsLocation: string,
  ctaLabel: string,
  destination: string,
  options?: { external?: boolean; destination_type?: CtaDestinationType }
) {
  captureCtaClicked({
    cta_location: analyticsLocation,
    cta_label: ctaLabel,
    destination,
    destination_type:
      options?.destination_type ?? inferDestinationType(destination, { external: options?.external }),
  })
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "")
}

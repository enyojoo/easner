export const BUSINESS_SIGNUP_PATH = "/auth/signup"

export const BUSINESS_SIGNUP_BASE = `https://business.easner.com${BUSINESS_SIGNUP_PATH}`

export function isBusinessEasnerUrl(href: string): boolean {
  try {
    const url = new URL(href, "https://easner.com")
    return url.hostname === "business.easner.com"
  } catch {
    return href.includes("business.easner.com")
  }
}

export function buildBusinessSignupUrl(
  campaign: string,
  options?: { source?: string; medium?: string }
): string {
  const url = new URL(BUSINESS_SIGNUP_BASE)
  url.searchParams.set("utm_source", options?.source ?? "easner_website")
  url.searchParams.set("utm_medium", options?.medium ?? "referral")
  url.searchParams.set("utm_campaign", campaign)
  return url.toString()
}

export function appendPostHogDistinctId(href: string, distinctId?: string | null): string {
  if (!distinctId) return href

  const url = new URL(href)
  url.searchParams.set("__ph_id", distinctId)
  return url.toString()
}

export function resolveBusinessSignupHref(
  href: string,
  campaign?: string,
  options?: { source?: string; medium?: string }
): string {
  if (!campaign || !isBusinessEasnerUrl(href)) return href
  return buildBusinessSignupUrl(campaign, options)
}

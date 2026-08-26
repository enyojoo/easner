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

/** Clean signup URL — attribution is passed via PostHog + `.easner.com` cookie, not query params. */
export function buildBusinessSignupUrl(_campaign?: string): string {
  return BUSINESS_SIGNUP_BASE
}

export function resolveBusinessSignupHref(href: string, _campaign?: string): string {
  if (!isBusinessEasnerUrl(href)) return href
  return buildBusinessSignupUrl()
}

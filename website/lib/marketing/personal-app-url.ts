import { PERSONAL_WEB_APP_URL } from "./constants"

export function isPersonalEasnerUrl(href: string): boolean {
  try {
    const url = new URL(href, "https://easner.com")
    return url.hostname === "app.easner.com"
  } catch {
    return href.includes("app.easner.com")
  }
}

/** Clean app URL — attribution is passed via PostHog + `.easner.com` cookie, not query params. */
export function buildPersonalAppUrl(base: string = PERSONAL_WEB_APP_URL): string {
  try {
    const url = new URL(base)
    url.search = ""
    url.hash = ""
    return url.toString()
  } catch {
    return PERSONAL_WEB_APP_URL
  }
}

export function resolvePersonalAppHref(href: string): string {
  if (!isPersonalEasnerUrl(href)) return href
  return buildPersonalAppUrl(href)
}

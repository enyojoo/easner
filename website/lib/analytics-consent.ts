/**
 * Analytics consent for EU/UK visitors.
 *
 * `proxy.ts` sets `easner_region` from Vercel's geo header. In the `consent` region PostHog starts in
 * memory-only mode (no cookies, localStorage or sessionStorage) so anonymous page views still count,
 * and only switches to persistent tracking once the visitor accepts. Everywhere else tracking is full.
 *
 * Both cookies here are strictly necessary: the region decides which rules apply, and the choice
 * cookie remembers the answer. Neither holds an identifier.
 */

export const REGION_COOKIE = "easner_region"
export const CONSENT_COOKIE = "easner_analytics_consent"
export const CONSENT_CHANGE_EVENT = "easner:analytics-consent"

export type AnalyticsRegion = "consent" | "open"
export type AnalyticsConsent = "granted" | "denied"

/** 6 months, the upper end regulators expect before asking again. */
const CONSENT_MAX_AGE_SECONDS = 60 * 60 * 24 * 182

/**
 * Where analytics cookies need prior opt-in consent: the EU (ePrivacy Directive), the rest of the EEA,
 * and the UK (PECR). Switzerland is left out: its law only requires an opt-out, which the privacy policy covers.
 */
const CONSENT_COUNTRIES = new Set([
  // EU
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR", "HU", "IE", "IT", "LV", "LT",
  "LU", "MT", "NL", "PL", "PT", "RO", "SK", "SI", "ES", "SE",
  // EU regions Vercel reports under their own codes (French overseas regions, Åland)
  "GF", "GP", "MQ", "RE", "YT", "MF", "AX",
  // Rest of the EEA
  "IS", "LI", "NO",
  // UK, and Gibraltar (follows the UK rules)
  "GB", "GI",
])

/** Unknown country fails closed: ask for consent rather than assume it. */
export function regionForCountry(country: string | null | undefined): AnalyticsRegion {
  if (!country) return "consent"
  return CONSENT_COUNTRIES.has(country.toUpperCase()) ? "consent" : "open"
}

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null
  const match = document.cookie.split("; ").find((part) => part.startsWith(`${name}=`))
  return match ? decodeURIComponent(match.slice(name.length + 1)) : null
}

export function getAnalyticsRegion(): AnalyticsRegion {
  const value = readCookie(REGION_COOKIE)
  // No cookie on the client means the proxy did not run (e.g. a static export): fail closed.
  return value === "open" ? "open" : "consent"
}

export function getAnalyticsConsent(): AnalyticsConsent | null {
  const value = readCookie(CONSENT_COOKIE)
  return value === "granted" || value === "denied" ? value : null
}

/** True when PostHog and attribution cookies may write to the browser. */
export function canPersistAnalytics(): boolean {
  return getAnalyticsRegion() === "open" || getAnalyticsConsent() === "granted"
}

export function setAnalyticsConsent(consent: AnalyticsConsent) {
  if (typeof document === "undefined") return
  const secure = window.location.protocol === "https:" ? "; Secure" : ""
  document.cookie = `${CONSENT_COOKIE}=${consent}; Path=/; Max-Age=${CONSENT_MAX_AGE_SECONDS}; SameSite=Lax${secure}`
  window.dispatchEvent(new CustomEvent<AnalyticsConsent>(CONSENT_CHANGE_EVENT, { detail: consent }))
}

/** Event fired by the footer link to reopen the consent prompt. */
export const CONSENT_REOPEN_EVENT = "easner:analytics-consent-open"

export function reopenConsentPrompt() {
  window.dispatchEvent(new Event(CONSENT_REOPEN_EVENT))
}

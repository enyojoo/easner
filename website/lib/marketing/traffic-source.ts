import { posthog } from "@/lib/posthog"

export const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"] as const

export type UtmKey = (typeof UTM_KEYS)[number]
export type SessionUtms = Partial<Record<UtmKey, string>>

/** UTMs from the current URL, or from PostHog session props if the URL has none. */
export function readSessionUtms(): SessionUtms {
  if (typeof window === "undefined") return {}

  const params = new URLSearchParams(window.location.search)
  const fromUrl: SessionUtms = {}

  for (const key of UTM_KEYS) {
    const value = params.get(key)
    if (value) fromUrl[key] = value
  }

  if (Object.keys(fromUrl).length > 0) return fromUrl

  const fromPostHog: SessionUtms = {}
  for (const key of UTM_KEYS) {
    const value = posthog.get_property?.(key)
    if (typeof value === "string" && value) fromPostHog[key] = value
  }

  return fromPostHog
}

/** Persist session UTMs and first-touch referrer/landing page for attribution. */
export function registerTrafficSource() {
  if (typeof window === "undefined") return

  const sessionAttribution: SessionUtms = {}

  for (const key of UTM_KEYS) {
    const value = new URLSearchParams(window.location.search).get(key)
    if (value) sessionAttribution[key] = value
  }

  if (Object.keys(sessionAttribution).length > 0) {
    posthog.register(sessionAttribution)
  }

  let referringDomain = "$direct"
  if (document.referrer) {
    try {
      referringDomain = new URL(document.referrer).hostname
    } catch {
      referringDomain = document.referrer
    }
  }

  posthog.register_once({
    initial_landing_path: window.location.pathname,
    initial_landing_url: window.location.href,
    initial_referrer: document.referrer || "$direct",
    initial_referring_domain: referringDomain,
  })
}

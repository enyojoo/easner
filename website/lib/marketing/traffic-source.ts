import { posthog } from "@/lib/posthog"

const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"] as const

/** Persist session UTMs and first-touch referrer/landing page for attribution. */
export function registerTrafficSource() {
  if (typeof window === "undefined") return

  const params = new URLSearchParams(window.location.search)
  const sessionAttribution: Record<string, string> = {}

  for (const key of UTM_KEYS) {
    const value = params.get(key)
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

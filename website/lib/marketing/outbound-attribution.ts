import { posthog } from "@/lib/posthog"
import { readSessionUtms, UTM_KEYS } from "@/lib/marketing/traffic-source"

export type OutboundDestination = "business" | "personal"

const OUTBOUND_REF_COOKIE = "easner_outbound_ref"
const OUTBOUND_DEST_COOKIE = "easner_outbound_dest"
const PH_ID_COOKIE = "easner_ph_id"
const OUTBOUND_COOKIE_MAX_AGE_SECONDS = 60 * 60

function setCrossSubdomainCookie(name: string, value: string) {
  const secure = window.location.protocol === "https:" ? "; Secure" : ""
  document.cookie = `${name}=${encodeURIComponent(value)}; Domain=.easner.com; Path=/; Max-Age=${OUTBOUND_COOKIE_MAX_AGE_SECONDS}; SameSite=Lax${secure}`
}

/**
 * Persist outbound attribution in PostHog (cross-subdomain cookie) and short-lived
 * `.easner.com` cookies so business/app can read it without URL params.
 *
 * - Inbound UTMs (e.g. /business?utm_source=google) are forwarded as-is.
 * - Site-originated clicks use easner_website / referral / {campaign}.
 * - PostHog distinct id is written to `easner_ph_id` (URL-free alternative to __ph_id).
 */
export function registerOutboundAttribution(campaign: string, destination: OutboundDestination) {
  if (typeof window === "undefined") return

  const inboundUtms = readSessionUtms()
  const hasInboundUtms = Object.keys(inboundUtms).length > 0

  const utms = hasInboundUtms
    ? inboundUtms
    : {
        utm_source: "easner_website",
        utm_medium: "referral",
        utm_campaign: campaign,
      }

  posthog.register({
    ...utms,
    easner_outbound_ref: campaign,
    easner_outbound_dest: destination,
  })

  setCrossSubdomainCookie(OUTBOUND_REF_COOKIE, campaign)
  setCrossSubdomainCookie(OUTBOUND_DEST_COOKIE, destination)

  for (const key of UTM_KEYS) {
    const value = utms[key]
    if (value) setCrossSubdomainCookie(key, value)
  }

  const distinctId = posthog.get_distinct_id?.()
  if (distinctId) setCrossSubdomainCookie(PH_ID_COOKIE, distinctId)
}

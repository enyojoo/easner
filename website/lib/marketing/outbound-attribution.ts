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
 * - Untagged organic/direct visits keep their acquisition source. Internal CTA
 *   placement is recorded separately, never as a new acquisition campaign.
 * - PostHog distinct id is written to `easner_ph_id` (URL-free alternative to __ph_id).
 */
export function registerOutboundAttribution(campaign: string, destination: OutboundDestination) {
  if (typeof window === "undefined") return

  const inboundUtms = readSessionUtms()

  posthog.register({
    ...inboundUtms,
    easner_outbound_ref: campaign,
    easner_outbound_dest: destination,
  })

  setCrossSubdomainCookie(OUTBOUND_REF_COOKIE, campaign)
  setCrossSubdomainCookie(OUTBOUND_DEST_COOKIE, destination)

  for (const key of UTM_KEYS) {
    const value = inboundUtms[key]
    if (value) setCrossSubdomainCookie(key, value)
  }

  const distinctId = posthog.get_distinct_id?.()
  if (distinctId) setCrossSubdomainCookie(PH_ID_COOKIE, distinctId)
}

import { canPersistAnalytics } from "@/lib/analytics-consent"
import {
  attributionFromVisit,
  attributionProperties,
  campaignFromSearch,
  CLICK_ID_KEYS,
  SESSION_ATTR_KEY,
  UTM_KEYS,
  utmsOf,
  type SessionAttribution,
  type SessionUtms,
  type UtmKey,
} from "@/lib/marketing/attribution"
import { posthog } from "@/lib/posthog"

export { UTM_KEYS, type SessionUtms, type UtmKey }

let memory: SessionAttribution | null = null

function readWindowAttr(): SessionAttribution | null {
  const value = window.__easnerAttr
  if (!value || typeof value !== "object" || typeof value.session_landing_path !== "string") return null
  return value
}

function readStored(): SessionAttribution | null {
  if (memory) return memory
  const fromWindow = readWindowAttr()
  if (!canPersistAnalytics()) return fromWindow
  try {
    const raw = sessionStorage.getItem(SESSION_ATTR_KEY)
    if (!raw) return fromWindow
    const parsed = JSON.parse(raw) as SessionAttribution
    if (!parsed || typeof parsed.session_landing_path !== "string") return fromWindow
    memory = parsed
    return parsed
  } catch {
    return fromWindow
  }
}

function writeStored(value: SessionAttribution) {
  memory = value
  window.__easnerAttr = value
  if (!canPersistAnalytics()) return
  try {
    sessionStorage.setItem(SESSION_ATTR_KEY, JSON.stringify(value))
  } catch {
    // Storage can be blocked. The in-memory copy still covers this page.
  }
}

export function clearSessionAttribution() {
  memory = null
  if (typeof window === "undefined") return
  delete window.__easnerAttr
  try {
    sessionStorage.removeItem(SESSION_ATTR_KEY)
  } catch {
    // Nothing to clear.
  }
}

/** UTMs for this visit: the URL when it has them, otherwise the session landing. */
export function readSessionUtms(): SessionUtms {
  if (typeof window === "undefined") return {}
  const urlUtms = utmsOf(campaignFromSearch(window.location.search))
  if (Object.keys(urlUtms).length > 0) return urlUtms
  return utmsOf(readStored())
}

export function currentAttribution(): SessionAttribution | null {
  if (typeof window === "undefined") return null
  return readStored()
}

/**
 * Remember how this visit started, and attach it to later events in the same tab.
 * Drops UTMs previously saved on the long-lived PostHog cookie so a past campaign
 * does not keep labelling every future visit.
 */
export function registerTrafficSource() {
  if (typeof window === "undefined") return

  const next = attributionFromVisit({
    search: window.location.search,
    referrer: document.referrer,
    href: window.location.href,
    pathname: window.location.pathname,
    previous: readStored(),
  })
  writeStored(next)

  for (const key of [...UTM_KEYS, ...CLICK_ID_KEYS]) {
    posthog.unregister?.(key)
  }

  const properties = attributionProperties(next)
  posthog.register_for_session?.(properties)
  posthog.register_once?.({
    initial_landing_path: next.session_landing_path,
    initial_landing_url: next.session_landing_url,
    initial_referrer: next.session_referrer,
    initial_referring_domain: next.session_referring_domain,
  })
}

/** Copy session attribution onto an event. Removes UTM keys this visit did not arrive with. */
export function stampEventProperties(properties: Record<string, unknown>) {
  const attribution = typeof window === "undefined" ? null : readStored()
  const session = attribution ? attributionProperties(attribution) : {}

  for (const key of UTM_KEYS) {
    if (session[key]) properties[key] = session[key]
    else delete properties[key]
  }
  for (const key of CLICK_ID_KEYS) {
    if (session[key]) properties[key] = session[key]
    else delete properties[key]
  }
  for (const key of [
    "session_landing_path",
    "session_landing_url",
    "session_referrer",
    "session_referring_domain",
    "acquisition_channel",
  ] as const) {
    if (session[key]) properties[key] = session[key]
  }
}

declare global {
  interface Window {
    __easnerAttr?: SessionAttribution
  }
}

"use client"

import posthog from "posthog-js"
import { canPersistAnalytics } from "@/lib/analytics-consent"
import { registerTrafficSource, stampEventProperties, clearSessionAttribution } from "@/lib/marketing/traffic-source"

const PERSISTENT = "localStorage+cookie" as const

/** Same-origin proxy. `next.config.mjs` forwards this to `NEXT_PUBLIC_POSTHOG_HOST`. */
const BROWSER_API_HOST = "/ingest"

function posthogUiHost(ingestHost: string): string {
  try {
    const hostname = new URL(ingestHost).hostname
    if (hostname.startsWith("eu.")) return "https://eu.posthog.com"
    return "https://us.posthog.com"
  } catch {
    return "https://us.posthog.com"
  }
}

let initialized = false

export function isPostHogReady() {
  return initialized
}

export function initPostHog() {
  if (typeof window === "undefined" || initialized) return

  const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY
  const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST
  if (!posthogKey || !posthogHost) return

  // EU/UK without consent: memory only. Events still send (anonymous, per page load); nothing is
  // written to cookies, localStorage or sessionStorage. See lib/analytics-consent.ts.
  const persist = canPersistAnalytics()

  posthog.init(posthogKey, {
    api_host: BROWSER_API_HOST,
    ui_host: posthogUiHost(posthogHost),
    // Manual $pageview on route change (PostHogProvider) — required for App Router SPA nav.
    capture_pageview: false,
    capture_pageleave: true,
    // Clicks, rage clicks, and dead clicks. Named CTAs are also sent as cta_clicked.
    autocapture: true,
    rageclick: true,
    capture_exceptions: true,
    // Core Web Vitals (LCP, INP, CLS, FCP) as $web_vitals events, read by the admin's nightly analytics rollup.
    capture_performance: { web_vitals: true },
    persistence: persist ? PERSISTENT : "memory",
    cross_subdomain_cookie: true,
    secure_cookie: true,
    // Recording and surveys keep state in browser storage, so they wait for consent.
    disable_session_recording: !persist,
    disable_surveys: !persist,
    before_send: (event) => {
      if (!event?.properties) return event
      stampEventProperties(event.properties as Record<string, unknown>)
      return event
    },
    loaded: () => {
      registerTrafficSource()
      if (process.env.NODE_ENV === "development") {
        console.log(`PostHog loaded (${persist ? "persistent" : "memory-only"})`)
      }
    },
    on_xhr_error: (failedRequest) => {
      if (process.env.NODE_ENV === "development") {
        console.warn("PostHog request failed:", failedRequest)
      }
    },
  })
  initialized = true
}

/** Switch a running PostHog between memory-only and persistent storage after a consent change. */
export function applyAnalyticsPersistence(persist: boolean) {
  if (!initialized) return

  posthog.set_config({
    persistence: persist ? PERSISTENT : "memory",
    disable_session_recording: !persist,
    disable_surveys: !persist,
  })

  if (!persist) clearAnalyticsStorage()
  else registerTrafficSource()
}

/** Remove anything PostHog or outbound attribution left behind, used when consent is withdrawn. */
function clearAnalyticsStorage() {
  clearSessionAttribution()
  for (const store of [window.localStorage, window.sessionStorage]) {
    try {
      for (const key of Object.keys(store)) {
        if (key.startsWith("ph_") || key.startsWith("__ph")) store.removeItem(key)
      }
    } catch {
      // Storage can be blocked; nothing to clear then.
    }
  }

  const host = window.location.hostname
  const domains = ["", `; Domain=${host}`, "; Domain=.easner.com"]
  for (const part of document.cookie.split("; ")) {
    const name = part.split("=")[0]
    const isAnalytics =
      name.startsWith("ph_") ||
      name.startsWith("__ph") ||
      name.startsWith("easner_outbound_") ||
      name === "easner_ph_id" ||
      name.startsWith("utm_")
    if (!isAnalytics) continue
    for (const domain of domains) {
      document.cookie = `${name}=; Path=/; Max-Age=0${domain}`
    }
  }
}

export { posthog }

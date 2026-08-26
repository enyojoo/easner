"use client"

import posthog from "posthog-js"
import { registerTrafficSource } from "@/lib/marketing/traffic-source"

export function initPostHog() {
  if (typeof window !== "undefined") {
    const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY
    const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST

    if (posthogKey && posthogHost) {
      posthog.init(posthogKey, {
        api_host: posthogHost,
        // Manual $pageview on route change (PostHogProvider) — required for App Router SPA nav.
        capture_pageview: false,
        capture_pageleave: true,
        persistence: "localStorage+cookie",
        cross_subdomain_cookie: true,
        secure_cookie: true,
        loaded: () => {
          registerTrafficSource()
          if (process.env.NODE_ENV === "development") {
            console.log("PostHog loaded")
          }
        },
        on_xhr_error: (failedRequest) => {
          if (process.env.NODE_ENV === "development") {
            console.warn("PostHog request failed:", failedRequest)
          }
        },
      })
    }
  }
}

export { posthog }

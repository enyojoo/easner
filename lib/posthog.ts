'use client'

import posthog from 'posthog-js'

export function initPostHog() {
  if (typeof window !== 'undefined') {
    const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY
    const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST

    if (posthogKey && posthogHost) {
      posthog.init(posthogKey, {
        api_host: posthogHost,
        capture_pageview: false, // We'll handle this manually
        capture_pageleave: true,
        // Fix CORS issues by using proper configuration
        cross_subdomain_cookie: false,
        secure_cookie: true,
        loaded: (posthog) => {
          if (process.env.NODE_ENV === 'development') {
            console.log('PostHog loaded')
          }
        },
        // Add error handling
        on_xhr_error: (failedRequest) => {
          if (process.env.NODE_ENV === 'development') {
            console.warn('PostHog request failed:', failedRequest)
          }
        }
      })
    }
  }
}

export { posthog }

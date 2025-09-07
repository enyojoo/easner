'use client'

import posthog from 'posthog-js'

let posthogInitialized = false

export function initPostHog() {
  if (typeof window !== 'undefined' && !posthogInitialized) {
    const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY
    const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST

    // Only initialize if we have the required environment variables
    if (posthogKey && posthogHost) {
      try {
        posthog.init(posthogKey, {
          api_host: posthogHost,
          capture_pageview: false, // We'll handle this manually
          capture_pageleave: true,
          // Disable automatic pageview capture to avoid CORS issues
          autocapture: false,
          // Add proper error handling
          loaded: (posthog) => {
            posthogInitialized = true
            if (process.env.NODE_ENV === 'development') {
              console.log('PostHog loaded successfully')
            }
          },
          // Handle initialization errors
          on_xhr_error: (failedRequest) => {
            if (process.env.NODE_ENV === 'development') {
              console.warn('PostHog XHR error:', failedRequest)
            }
          }
        })
      } catch (error) {
        console.warn('PostHog initialization failed:', error)
        posthogInitialized = false
      }
    } else {
      if (process.env.NODE_ENV === 'development') {
        console.warn('PostHog not initialized: Missing environment variables')
      }
    }
  }
}

// Safe wrapper for posthog operations
export function safePostHogCapture(event: string, properties?: any) {
  if (typeof window !== 'undefined' && posthogInitialized) {
    try {
      posthog.capture(event, properties)
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('PostHog capture failed:', error)
      }
    }
  }
}

export { posthog }

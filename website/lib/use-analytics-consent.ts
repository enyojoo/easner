"use client"

import { useSyncExternalStore } from "react"
import {
  CONSENT_CHANGE_EVENT,
  getAnalyticsConsent,
  getAnalyticsRegion,
  type AnalyticsConsent,
  type AnalyticsRegion,
} from "@/lib/analytics-consent"

function subscribe(onChange: () => void) {
  window.addEventListener(CONSENT_CHANGE_EVENT, onChange)
  return () => window.removeEventListener(CONSENT_CHANGE_EVENT, onChange)
}

const noop = () => () => {}

/** Region from the proxy cookie. `null` during server render and hydration. */
export function useAnalyticsRegion(): AnalyticsRegion | null {
  return useSyncExternalStore(noop, getAnalyticsRegion, () => null)
}

/** Stored analytics choice; `undefined` during server render and hydration, `null` if not chosen yet. */
export function useAnalyticsConsent(): AnalyticsConsent | null | undefined {
  return useSyncExternalStore(subscribe, getAnalyticsConsent, () => undefined)
}

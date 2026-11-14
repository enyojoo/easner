"use client"

import { reopenConsentPrompt } from "@/lib/analytics-consent"
import { useAnalyticsRegion } from "@/lib/use-analytics-consent"

/** Footer control to change the analytics choice. Only shown where we ask for consent (EU/UK). */
export function CookieSettingsLink() {
  if (useAnalyticsRegion() !== "consent") return null

  return (
    <button type="button" onClick={reopenConsentPrompt} className="text-sm text-web-meta transition-colors hover:text-brand-primary">
      Cookie settings
    </button>
  )
}

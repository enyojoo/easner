"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CONSENT_REOPEN_EVENT, setAnalyticsConsent, type AnalyticsConsent } from "@/lib/analytics-consent"
import { applyAnalyticsPersistence } from "@/lib/posthog"
import { useAnalyticsConsent, useAnalyticsRegion } from "@/lib/use-analytics-consent"

/**
 * Small consent prompt for EU/UK visitors. Page views are already counted without cookies;
 * accepting only lets analytics remember the visitor across pages and visits.
 */
export function AnalyticsConsentPrompt() {
  const region = useAnalyticsRegion()
  const consent = useAnalyticsConsent()
  const [reopened, setReopened] = useState(false)

  useEffect(() => {
    const reopen = () => setReopened(true)
    window.addEventListener(CONSENT_REOPEN_EVENT, reopen)
    return () => window.removeEventListener(CONSENT_REOPEN_EVENT, reopen)
  }, [])

  const open = reopened || (region === "consent" && consent === null)
  if (!open) return null

  const choose = (choice: AnalyticsConsent) => {
    setAnalyticsConsent(choice)
    applyAnalyticsPersistence(choice === "granted")
    setReopened(false)
  }

  return (
    <div
      role="region"
      aria-label="Analytics cookies"
      className="fixed inset-x-4 bottom-4 z-50 rounded-xl border border-web-hairline bg-web-canvas p-5 shadow-panel sm:inset-x-auto sm:left-6 sm:bottom-6 sm:max-w-sm sm:rounded-2xl"
    >
      <p className="text-sm leading-6 text-web-body">
        We use cookies to improve our site.{" "}
        <Link href="/privacy#cookies" className="text-web-ink underline underline-offset-4 hover:text-brand-primary">
          Learn more
        </Link>
      </p>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <Button type="button" variant="outline" pill className="h-10 sm:h-10" onClick={() => choose("denied")}>
          Decline
        </Button>
        <Button type="button" variant="outline" pill className="h-10 sm:h-10" onClick={() => choose("granted")}>
          Accept
        </Button>
      </div>
    </div>
  )
}

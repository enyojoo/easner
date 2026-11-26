"use client"

import { useLayoutEffect } from "react"
import { usePathname } from "next/navigation"
import { AnalyticsConsentPrompt } from "@/components/analytics-consent-prompt"
import { initPostHog, posthog } from "@/lib/posthog"
import { installBehaviorTracking } from "@/lib/marketing/auto-track"
import { captureMarketingPageViewed, getMarketingPageName } from "@/lib/marketing/analytics"
import { registerTrafficSource } from "@/lib/marketing/traffic-source"

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  useLayoutEffect(() => {
    initPostHog()
    installBehaviorTracking()
  }, [])

  useLayoutEffect(() => {
    if (!pathname) return

    initPostHog()
    registerTrafficSource()

    posthog.capture("$pageview", {
      $current_url: window.location.href,
      page_path: pathname,
      page_name: getMarketingPageName(pathname),
    })

    captureMarketingPageViewed(pathname)
  }, [pathname])

  return (
    <>
      {children}
      <AnalyticsConsentPrompt />
    </>
  )
}

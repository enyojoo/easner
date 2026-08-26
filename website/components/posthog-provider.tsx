"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"
import { initPostHog, posthog } from "@/lib/posthog"
import { captureMarketingPageViewed, getMarketingPageName } from "@/lib/marketing/analytics"

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  useEffect(() => {
    initPostHog()
  }, [])

  useEffect(() => {
    if (typeof window === "undefined" || !pathname) return

    posthog.capture("$pageview", {
      $current_url: window.location.href,
      page_path: pathname,
      page_name: getMarketingPageName(pathname),
    })

    captureMarketingPageViewed(pathname)
  }, [pathname])

  return <>{children}</>
}

'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { initPostHog, safePostHogCapture } from '@/lib/posthog'

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  useEffect(() => {
    initPostHog()
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined' && pathname) {
      safePostHogCapture('$pageview', {
        $current_url: window.location.href,
      })
    }
  }, [pathname])

  return <>{children}</>
}

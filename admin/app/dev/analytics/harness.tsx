"use client"

import { useState } from "react"
import { AnalyticsView } from "@/components/analytics/analytics-view"
import { ConnectState } from "@/components/analytics/analytics-view"
import { PerformanceTab } from "@/components/analytics/performance-tab"
import { AnalyticsSourceProvider } from "@/lib/analytics/hooks"
import { SAMPLE_POSTS, createSampleSource } from "@/lib/analytics/sample"
import { isoDay } from "@/lib/analytics/paths"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"

/**
 * Development harness: the real Analytics page and a post's Performance tab on deterministic sample data, no sign-in
 * and no keys. `/dev/analytics`, or `?view=performance` for the per-post tab. Enabled only with NODE_ENV=development
 * and ADMIN_DEV_HARNESS=1 (app/dev/layout.tsx answers 404 otherwise).
 */
function Inner() {
  const [source] = useState(() => createSampleSource(isoDay(new Date())))
  const view = useSearchParams().get("view")
  return (
    <AnalyticsSourceProvider id="sample" source={source}>
      <div className="mx-auto max-w-[1280px] p-8">
        {view === "connect" ? (
          <div className="space-y-6">
            <ConnectState missing={["POSTHOG_PROJECT_ID", "POSTHOG_PERSONAL_API_KEY"]} />
            <ConnectState waiting />
          </div>
        ) : view === "performance" ? (
          <div className="mx-auto w-[400px] rounded-xl border border-border bg-card">
            <PerformanceTab postId={SAMPLE_POSTS[0].id} slug={SAMPLE_POSTS[0].slug} status="published" />
          </div>
        ) : (
          <AnalyticsView />
        )}
      </div>
    </AnalyticsSourceProvider>
  )
}

export function AnalyticsHarness() {
  return (
    <Suspense fallback={null}>
      <Inner />
    </Suspense>
  )
}

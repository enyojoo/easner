"use client"

import { Suspense, useState } from "react"
import { useSearchParams } from "next/navigation"
import { AdminShell } from "@/components/layout/admin-shell"
import { OverviewView, type OverviewPost } from "@/components/overview/overview-view"
import { AnalyticsSourceProvider } from "@/lib/analytics/hooks"
import { isoDay, addDays } from "@/lib/analytics/paths"
import { SAMPLE_POSTS, createSampleSource } from "@/lib/analytics/sample"
import type { AnalyticsSource } from "@/lib/analytics/source"

/**
 * Development harness: the real Overview on deterministic sample data, inside a stand-in for the admin shell, no sign-in
 * and no keys. `/dev/overview`; `?view=connect` shows PostHog not connected, `?view=empty` no posts, `?role=writer` a Writer, `?shell=1` inside the real shell (sidebar and header).
 * Enabled only with NODE_ENV=development and ADMIN_DEV_HARNESS=1 (app/dev/layout.tsx answers 404 otherwise).
 */
const CATEGORIES = [
  { id: "c1", name: "Sending money" },
  { id: "c2", name: "Business" },
  { id: "c3", name: "Freelancers" },
  { id: "c4", name: "Money basics" },
]
const CATEGORY_ID: Record<string, string> = { "Sending money": "c1", Business: "c2", Freelancers: "c3", "Money basics": "c4" }
const AUTHORS = ["Ada Okafor", "Wanjiru Kamau", "Daniel Mensah", "Tomás Rivera", "Ada Okafor", "Product team"]

function buildPosts(today: string): OverviewPost[] {
  const base = { created_by: "someone-else", claims_flagged: false, has_unpublished_changes: false, slug: "x", updated_at: `${today}T08:00:00Z`, scheduled_for: null }
  const published: OverviewPost[] = SAMPLE_POSTS.map((p, i) => ({
    ...base, id: p.id, title: p.title, status: "published", published_at: `${addDays(today, -p.ageDays)}T09:00:00Z`,
    category_id: CATEGORY_ID[p.category], authors: [{ id: `a${i}`, name: AUTHORS[i] }],
  }))
  const soon = new Date(Date.now() + 30 * 3600_000).toISOString()
  return [
    ...published,
    { ...base, id: "r1", title: "Sending money to Kenya: M-Pesa, bank or card?", status: "in_review", published_at: null, authors: [] },
    { ...base, id: "r2", title: "What stablecoin settlement means for your invoices", status: "in_review", published_at: null, authors: [] },
    { ...base, id: "r3", title: "Invoicing clients in Mexico", status: "in_review", claims_flagged: true, published_at: null, authors: [] },
    { ...base, id: "s1", title: "Our seed round, and what comes next", status: "scheduled", scheduled_for: soon, published_at: null, authors: [] },
    { ...base, id: "d1", title: "Holding USD and EUR: a guide for freelancers", status: "draft", published_at: null, authors: [] },
    { ...base, id: "d2", title: "Checkout for your own website, explained", status: "changes_requested", published_at: null, authors: [] },
  ]
}

const connectSource = (source: AnalyticsSource): AnalyticsSource => ({ ...source, status: async () => ({ state: "connect", missing: ["POSTHOG_PROJECT_ID", "POSTHOG_PERSONAL_API_KEY"] }) })

function Inner() {
  const params = useSearchParams()
  const view = params.get("view")
  const role = params.get("role") ?? "owner"
  const [today] = useState(() => isoDay(new Date()))
  const [source] = useState(() => {
    const sample = createSampleSource(today)
    return view === "connect" ? connectSource(sample) : sample
  })
  const [posts] = useState(() => buildPosts(today))
  const [updatedAt] = useState(() => Date.now() - 4 * 60_000)
  const page = (
    <OverviewView
      posts={view === "empty" ? [] : posts}
      categories={CATEGORIES}
      role={role}
      userId="me"
      updatedAt={updatedAt}
    />
  )
  return (
    <AnalyticsSourceProvider id="sample" source={source}>
      {params.get("shell") === "1" ? <AdminShell>{page}</AdminShell> : <div className="mx-auto w-full max-w-[1440px] px-8 pb-10 pt-6">{page}</div>}
    </AnalyticsSourceProvider>
  )
}

export function OverviewHarness() {
  return (
    <Suspense fallback={null}>
      <Inner />
    </Suspense>
  )
}

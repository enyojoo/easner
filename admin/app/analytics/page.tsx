import type { Metadata } from "next"
import { ChartLine } from "lucide-react"
import { PlaceholderPage } from "@/components/placeholder-page"

export const metadata: Metadata = { title: "Analytics" }

export default function Page() {
  return (
    <PlaceholderPage
      title="Analytics"
      description="Visitors, pages and sources across easner.com."
      icon={ChartLine}
      emptyTitle="Analytics isn’t connected yet"
      emptyMessage="Website and blog traffic, sources, locations and conversions will show here once PostHog and Search Console are connected."
    />
  )
}

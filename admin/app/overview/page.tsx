import type { Metadata } from "next"
import { LayoutDashboard } from "lucide-react"
import { PlaceholderPage } from "@/components/placeholder-page"

export const metadata: Metadata = { title: "Overview" }

export default function Page() {
  return (
    <PlaceholderPage
      title="Overview"
      description="What needs you, and what’s working."
      icon={LayoutDashboard}
      emptyTitle="Nothing needs you yet"
      emptyMessage="Posts waiting for review, scheduled posts and SEO issues will show here, with views and sign-ups from the blog."
    />
  )
}

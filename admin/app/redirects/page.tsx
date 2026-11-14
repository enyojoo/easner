import type { Metadata } from "next"
import { Signpost } from "lucide-react"
import { PlaceholderPage } from "@/components/placeholder-page"

export const metadata: Metadata = { title: "Redirects" }

export default function Page() {
  return (
    <PlaceholderPage
      title="Redirects"
      description="Old blog URLs and where they send readers (301)."
      icon={Signpost}
      emptyTitle="No redirects yet"
      emptyMessage="When a published post’s slug changes, its old URL is kept here and redirects to the new one."
    />
  )
}

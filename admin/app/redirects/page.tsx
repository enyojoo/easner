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
      emptyTitle="Coming in the next release"
      emptyMessage="The redirects table arrives in the next release. Until then, a published post’s old URL is kept automatically when its slug changes."
    />
  )
}

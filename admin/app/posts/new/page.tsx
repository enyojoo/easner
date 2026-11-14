import type { Metadata } from "next"
import { PenLine } from "lucide-react"
import { PlaceholderPage } from "@/components/placeholder-page"

export const metadata: Metadata = { title: "New post" }

export default function Page() {
  return (
    <PlaceholderPage
      title="New post"
      description="Write, preview and send a post for review."
      icon={PenLine}
      emptyTitle="The editor isn’t ready yet"
      emptyMessage="Writing posts arrives with the editor. Posts, categories and the team are ready now."
    />
  )
}

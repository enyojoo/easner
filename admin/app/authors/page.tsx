import type { Metadata } from "next"
import { UserRoundPen } from "lucide-react"
import { PlaceholderPage } from "@/components/placeholder-page"

export const metadata: Metadata = { title: "Authors" }

export default function Page() {
  return (
    <PlaceholderPage
      title="Authors"
      description="Who writes for the blog, and their public profiles."
      icon={UserRoundPen}
      emptyTitle="No authors yet"
      emptyMessage="Author profiles (photo, role, bio and links) will show here. Guest authors don’t need a login."
    />
  )
}

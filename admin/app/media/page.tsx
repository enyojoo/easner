import type { Metadata } from "next"
import { Image as ImageIcon } from "lucide-react"
import { PlaceholderPage } from "@/components/placeholder-page"

export const metadata: Metadata = { title: "Media" }

export default function Page() {
  return (
    <PlaceholderPage
      title="Media"
      description="Every image used on the blog."
      icon={ImageIcon}
      emptyTitle="No media yet"
      emptyMessage="Images you upload to posts, authors and categories will show here, with their alt text and where they’re used."
    />
  )
}

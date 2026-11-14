import { IndexView, INDEX_DESCRIPTION, INDEX_TITLE } from "@/components/blog/index-view"
import { marketingMetadata } from "@/lib/marketing/metadata"
import { abs } from "@/lib/blog/urls"

export const revalidate = 3600

export const metadata = marketingMetadata({
  metadata: { title: "Blog", description: INDEX_DESCRIPTION },
  path: "/blog",
  images: [{ url: abs("/blog/opengraph-image"), alt: `Easner Blog – ${INDEX_TITLE}` }],
  alternateTypes: { "application/rss+xml": "/blog/feed.xml" },
})

export default function BlogIndexPage() {
  return <IndexView page={1} />
}

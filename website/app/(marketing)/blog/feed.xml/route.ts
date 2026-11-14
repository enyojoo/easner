import { buildFeed, feedResponse } from "@/lib/blog/feed"
import { getAllPosts } from "@/lib/blog/queries"

export const revalidate = 3600

export async function GET() {
  return feedResponse(
    await buildFeed({
      title: "Easner Blog",
      description: "Guides, product updates and ideas on banking across borders, from the people building Easner.",
      path: "/blog",
      posts: await getAllPosts(),
    }),
  )
}

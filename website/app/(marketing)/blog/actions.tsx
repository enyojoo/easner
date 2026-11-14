"use server"

import { PostGrid } from "@/components/blog/post-card"
import { getAllPosts, paginate, pickFeatured } from "@/lib/blog/queries"

/** The next page of the index (after the featured trio), as server-rendered cards for "Load more". */
export async function loadMorePosts(page: number) {
  const all = await getAllPosts()
  const featured = new Set(pickFeatured(all).map((p) => p.id))
  const { items } = paginate(all.filter((p) => !featured.has(p.id)), Math.max(2, Math.floor(page)))
  return <PostGrid posts={items} />
}

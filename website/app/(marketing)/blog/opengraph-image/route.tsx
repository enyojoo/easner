import { textCardResponse } from "@/lib/blog/share-card"

/** Share image for /blog: the text card (the index has no cover art of its own). */
export const dynamic = "force-static"

export async function GET() {
  return textCardResponse({ label: "Blog", title: "Notes on moving money", line: "Guides, product updates and ideas on banking across borders." })
}

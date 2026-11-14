import { textCardResponse } from "@/lib/blog/share-card"

export const dynamic = "force-static"

export async function GET() {
  return textCardResponse({ label: "Blog · Authors", title: "The people writing", line: "Everyone who writes for the Easner blog." })
}

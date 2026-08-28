import { createOgImage, OG_CONTENT_TYPE, OG_SIZE } from "@/lib/marketing/og-image"

export const alt = "Delete Your Easner Account"
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default async function Image() {
  return createOgImage({
    headline: "Delete Your Account",
    subhead:
      "How to request deletion of your Easner Personal Banking account and what happens to your data.",
  })
}

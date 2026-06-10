import { createOgImage, OG_CONTENT_TYPE, OG_SIZE } from "@/lib/marketing/og-image"
import { downloadHero } from "@/lib/marketing/content/download"

export const alt = "Download Easner Banking Beta"
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default async function Image() {
  return createOgImage({
    headline: downloadHero.headline,
    subhead: downloadHero.subhead,
  })
}

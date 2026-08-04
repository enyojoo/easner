import { createOgImage, OG_CONTENT_TYPE, OG_SIZE } from "@/lib/marketing/og-image"
import { aboutHero } from "@/lib/marketing/content/about"

export const alt = "About Easner – founders and mission"
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default async function Image() {
  return createOgImage({
    headline: aboutHero.headline,
    subhead: aboutHero.subhead,
  })
}

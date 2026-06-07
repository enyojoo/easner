import { createOgImage, OG_CONTENT_TYPE, OG_SIZE } from "@/lib/marketing/og-image"
import { homeHero } from "@/lib/marketing/content/home"

export const alt = homeHero.altText
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default async function Image() {
  return createOgImage({
    headline: homeHero.h1Lines,
    subhead: homeHero.subhead,
    visualSlot: homeHero.visualSlot,
  })
}

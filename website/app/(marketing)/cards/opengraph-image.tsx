import { createOgImage, OG_CONTENT_TYPE, OG_SIZE } from "@/lib/marketing/og-image"
import { cardsContent } from "@/lib/marketing/content/cards"

export const alt = cardsContent.hero.altText
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default async function Image() {
  return createOgImage({
    headline: cardsContent.hero.h1,
    subhead: cardsContent.hero.subhead,
  })
}

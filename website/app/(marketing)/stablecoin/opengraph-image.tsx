import { createOgImage, OG_CONTENT_TYPE, OG_SIZE } from "@/lib/marketing/og-image"
import { stablecoinContent } from "@/lib/marketing/content/stablecoin"

export const alt = stablecoinContent.hero.altText
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default async function Image() {
  return createOgImage({
    headline: stablecoinContent.hero.h1,
    subhead: stablecoinContent.hero.subhead,
  })
}

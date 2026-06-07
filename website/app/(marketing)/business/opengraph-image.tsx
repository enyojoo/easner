import { createOgImage, OG_CONTENT_TYPE, OG_SIZE } from "@/lib/marketing/og-image"
import { businessContent } from "@/lib/marketing/content/business"

export const alt = businessContent.hero.altText
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default async function Image() {
  return createOgImage({
    headline: businessContent.hero.h1,
    subhead: businessContent.hero.subhead,
  })
}

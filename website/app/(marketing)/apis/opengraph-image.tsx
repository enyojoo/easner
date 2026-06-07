import { createOgImage, OG_CONTENT_TYPE, OG_SIZE } from "@/lib/marketing/og-image"
import { apisContent } from "@/lib/marketing/content/apis"

export const alt = apisContent.hero.altText
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default async function Image() {
  return createOgImage({
    headline: apisContent.hero.h1,
    subhead: apisContent.hero.subhead,
  })
}

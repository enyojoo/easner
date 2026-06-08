import { createOgImage, OG_CONTENT_TYPE, OG_SIZE } from "@/lib/marketing/og-image"
import { developersContent } from "@/lib/marketing/content/developers"

export const alt = developersContent.hero.altText
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default async function Image() {
  return createOgImage({
    headline: developersContent.hero.h1,
    subhead: developersContent.hero.subhead,
  })
}

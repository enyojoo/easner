import { createOgImage, OG_CONTENT_TYPE, OG_SIZE } from "@/lib/marketing/og-image"
import { partnersContent } from "@/lib/marketing/content/partners"

export const alt = partnersContent.hero.altText
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default async function Image() {
  return createOgImage({
    headline: partnersContent.hero.h1,
    subhead: partnersContent.hero.subhead,
  })
}

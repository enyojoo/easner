import { createOgImage, OG_CONTENT_TYPE, OG_SIZE } from "@/lib/marketing/og-image"
import { personalContent } from "@/lib/marketing/content/personal"

export const alt = personalContent.hero.altText
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default async function Image() {
  return createOgImage({
    headline: personalContent.hero.h1,
    subhead: personalContent.hero.subhead,
  })
}

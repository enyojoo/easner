import { createOgImage, OG_CONTENT_TYPE, OG_SIZE } from "@/lib/marketing/og-image"
import { checkoutContent } from "@/lib/marketing/content/checkout"

export const alt = checkoutContent.hero.altText
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default async function Image() {
  return createOgImage({
    headline: checkoutContent.hero.h1,
    subhead: checkoutContent.hero.subhead,
  })
}

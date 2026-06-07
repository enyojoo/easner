import { createOgImage, OG_CONTENT_TYPE, OG_SIZE } from "@/lib/marketing/og-image"
import { invoicingContent } from "@/lib/marketing/content/invoicing"

export const alt = invoicingContent.hero.altText
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default async function Image() {
  return createOgImage({
    headline: invoicingContent.hero.h1,
    subhead: invoicingContent.hero.subhead,
    visualSlot: invoicingContent.hero.visualSlot,
  })
}

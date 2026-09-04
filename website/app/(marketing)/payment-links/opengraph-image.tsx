import { createOgImage, OG_CONTENT_TYPE, OG_SIZE } from "@/lib/marketing/og-image"
import { paymentLinksContent } from "@/lib/marketing/content/payment-links"

export const alt = paymentLinksContent.hero.altText
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default async function Image() {
  return createOgImage({
    headline: paymentLinksContent.hero.h1,
    subhead: paymentLinksContent.hero.subhead,
  })
}

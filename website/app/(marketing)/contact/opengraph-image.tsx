import { createOgImage, OG_CONTENT_TYPE, OG_SIZE } from "@/lib/marketing/og-image"
import { contactHero } from "@/lib/marketing/content/contact"

export const alt = "Contact the Easner team"
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default async function Image() {
  return createOgImage({
    headline: contactHero.headline,
    subhead: contactHero.subhead,
  })
}

import { createOgImage, OG_CONTENT_TYPE, OG_SIZE } from "@/lib/marketing/og-image"
import { homeHero } from "@/lib/marketing/content/home"

export const alt = "Easner Terms of Service"
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default async function Image() {
  return createOgImage({
    headline: "Terms of Service",
    subhead: "Terms of Service for Easner Personal, Easner Business, and related financial technology services.",
    visualSlot: homeHero.visualSlot,
  })
}

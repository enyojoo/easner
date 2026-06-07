import { createOgImage, OG_CONTENT_TYPE, OG_SIZE } from "@/lib/marketing/og-image"
import { homeHero } from "@/lib/marketing/content/home"

export const alt = "Easner Privacy Policy"
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default async function Image() {
  return createOgImage({
    headline: "Privacy Policy",
    subhead:
      "How Easner Group, Inc. collects, uses, shares, and protects information across Easner Personal, Easner Business, and easner.com.",
    visualSlot: homeHero.visualSlot,
  })
}

import { createOgImage, OG_CONTENT_TYPE, OG_SIZE } from "@/lib/marketing/og-image"
import { payrollContent } from "@/lib/marketing/content/payroll"

export const alt = payrollContent.hero.altText
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default async function Image() {
  return createOgImage({
    headline: payrollContent.hero.h1,
    subhead: payrollContent.hero.subhead,
  })
}

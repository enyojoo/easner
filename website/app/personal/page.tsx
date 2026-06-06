import type { Metadata } from "next"
import { ProductPage } from "@/components/marketing/product-page"
import { personalContent } from "@/lib/marketing/content/personal"

export const metadata: Metadata = {
  title: personalContent.metadata.title,
  description: personalContent.metadata.description,
  keywords: personalContent.metadata.keywords,
}

export default function PersonalPage() {
  return <ProductPage content={personalContent} />
}

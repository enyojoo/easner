import type { Metadata } from "next"
import { ProductPageSections } from "@/components/marketing/product-page-sections"
import { businessContent } from "@/lib/marketing/content/business"

export const metadata: Metadata = {
  title: businessContent.metadata.title,
  description: businessContent.metadata.description,
  keywords: businessContent.metadata.keywords,
}

export default function BusinessPage() {
  return <ProductPageSections content={businessContent} />
}

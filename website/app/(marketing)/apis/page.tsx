import type { Metadata } from "next"
import { ProductPageSections } from "@/components/marketing/product-page-sections"
import { apisContent } from "@/lib/marketing/content/apis"

export const metadata: Metadata = {
  title: apisContent.metadata.title,
  description: apisContent.metadata.description,
  keywords: apisContent.metadata.keywords,
}

export default function ApisPage() {
  return <ProductPageSections content={apisContent} />
}

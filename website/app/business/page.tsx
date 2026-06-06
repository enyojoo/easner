import type { Metadata } from "next"
import { ProductPage } from "@/components/marketing/product-page"
import { businessContent } from "@/lib/marketing/content/business"

export const metadata: Metadata = {
  title: businessContent.metadata.title,
  description: businessContent.metadata.description,
  keywords: businessContent.metadata.keywords,
}

export default function BusinessPage() {
  return <ProductPage content={businessContent} />
}

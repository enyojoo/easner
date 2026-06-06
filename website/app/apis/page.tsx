import type { Metadata } from "next"
import { ProductPage } from "@/components/marketing/product-page"
import { apisContent } from "@/lib/marketing/content/apis"

export const metadata: Metadata = {
  title: apisContent.metadata.title,
  description: apisContent.metadata.description,
  keywords: apisContent.metadata.keywords,
}

export default function ApisPage() {
  return <ProductPage content={apisContent} />
}

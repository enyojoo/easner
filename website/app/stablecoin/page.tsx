import type { Metadata } from "next"
import { ProductPage } from "@/components/marketing/product-page"
import { stablecoinContent } from "@/lib/marketing/content/stablecoin"

export const metadata: Metadata = {
  title: stablecoinContent.metadata.title,
  description: stablecoinContent.metadata.description,
  keywords: stablecoinContent.metadata.keywords,
}

export default function StablecoinPage() {
  return <ProductPage content={stablecoinContent} />
}

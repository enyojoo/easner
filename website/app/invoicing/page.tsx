import type { Metadata } from "next"
import { ProductPage } from "@/components/marketing/product-page"
import { invoicingContent } from "@/lib/marketing/content/invoicing"

export const metadata: Metadata = {
  title: invoicingContent.metadata.title,
  description: invoicingContent.metadata.description,
  keywords: invoicingContent.metadata.keywords,
}

export default function InvoicingPage() {
  return <ProductPage content={invoicingContent} />
}

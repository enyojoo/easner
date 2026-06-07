import type { Metadata } from "next"
import { ProductPageSections } from "@/components/marketing/product-page-sections"
import { invoicingContent } from "@/lib/marketing/content/invoicing"

export const metadata: Metadata = {
  title: invoicingContent.metadata.title,
  description: invoicingContent.metadata.description,
  keywords: invoicingContent.metadata.keywords,
}

export default function InvoicingPage() {
  return <ProductPageSections content={invoicingContent} />
}

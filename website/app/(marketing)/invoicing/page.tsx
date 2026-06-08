import { ProductPageSections } from "@/components/marketing/product-page-sections"
import { invoicingContent } from "@/lib/marketing/content/invoicing"
import { marketingMetadata } from "@/lib/marketing/metadata"

export const metadata = marketingMetadata({ metadata: invoicingContent.metadata, path: "/invoicing" })

export default function InvoicingPage() {
  return <ProductPageSections content={invoicingContent} />
}

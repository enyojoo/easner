import Script from "next/script"
import { ProductPageSections } from "@/components/marketing/product-page-sections"
import { invoicingContent } from "@/lib/marketing/content/invoicing"
import { marketingMetadata } from "@/lib/marketing/metadata"
import { breadcrumbJsonLd, CORRIDOR_AREA_SERVED, faqPageJsonLd, financialServiceJsonLd, jsonLdScript } from "@/lib/marketing/structured-data"

export const metadata = marketingMetadata({ metadata: invoicingContent.metadata, path: "/invoicing" })

export default function InvoicingPage() {
  return (
    <>
      <Script
        id="easner-invoicing-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript([
          financialServiceJsonLd({
            name: "Easner Invoicing",
            description: invoicingContent.metadata.description,
            path: "/invoicing",
            serviceType: "Global B2B invoicing with bank or stablecoin pay-in",
            areaServed: CORRIDOR_AREA_SERVED,
          }),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Invoicing", path: "/invoicing" },
          ]),
          ...(invoicingContent.faq ? [faqPageJsonLd(invoicingContent.faq)] : []),
        ])}
      />
      <ProductPageSections content={invoicingContent} />
    </>
  )
}

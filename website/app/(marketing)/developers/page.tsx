import Script from "next/script"
import { ProductPageSections } from "@/components/marketing/product-page-sections"
import { developersContent } from "@/lib/marketing/content/developers"
import { marketingMetadata } from "@/lib/marketing/metadata"
import { breadcrumbJsonLd, financialServiceJsonLd, jsonLdScript } from "@/lib/marketing/structured-data"

export const metadata = marketingMetadata({ metadata: developersContent.metadata, path: "/developers" })

export default function DevelopersPage() {
  return (
    <>
      <Script
        id="easner-developers-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript([
          financialServiceJsonLd({
            name: "Easner for Partners – Developer Model",
            description: developersContent.metadata.description,
            path: "/developers",
            serviceType: "Embedded payments API",
          }),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Developers", path: "/developers" },
          ]),
        ])}
      />
      <ProductPageSections content={developersContent} />
    </>
  )
}

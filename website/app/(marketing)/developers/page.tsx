import { ProductPageSections } from "@/components/marketing/product-page-sections"
import { developersContent } from "@/lib/marketing/content/developers"
import { marketingMetadata } from "@/lib/marketing/metadata"
import { breadcrumbJsonLd, financialServiceJsonLd, jsonLdScript } from "@/lib/marketing/structured-data"

export const metadata = marketingMetadata({ metadata: developersContent.metadata, path: "/developers" })

export default function DevelopersPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript([
          financialServiceJsonLd({
            name: "Easner API",
            description: developersContent.metadata.description,
            path: "/developers",
            serviceType: "Embedded banking and payments API",
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

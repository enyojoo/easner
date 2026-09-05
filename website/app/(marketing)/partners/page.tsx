import { ProductPageSections } from "@/components/marketing/product-page-sections"
import { partnersContent } from "@/lib/marketing/content/partners"
import { marketingMetadata } from "@/lib/marketing/metadata"
import { breadcrumbJsonLd, financialServiceJsonLd, jsonLdScript } from "@/lib/marketing/structured-data"

export const metadata = marketingMetadata({
  metadata: partnersContent.metadata,
  path: "/partners",
  titleAbsolute: partnersContent.metadata.title,
})

export default function PartnersPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript([
          financialServiceJsonLd({
            name: "Easner for Partners",
            description: partnersContent.metadata.description,
            path: "/partners",
            serviceType: "Branded cross-border programs, Agency Model",
          }),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Partners", path: "/partners" },
          ]),
        ])}
      />
      <ProductPageSections content={partnersContent} />
    </>
  )
}

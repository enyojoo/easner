import { ProductPageSections } from "@/components/marketing/product-page-sections"
import { payrollContent } from "@/lib/marketing/content/payroll"
import { marketingMetadata } from "@/lib/marketing/metadata"
import { breadcrumbJsonLd, CORRIDOR_AREA_SERVED, financialServiceJsonLd, jsonLdScript } from "@/lib/marketing/structured-data"

export const metadata = marketingMetadata({ metadata: payrollContent.metadata, path: "/payroll" })

export default function PayrollPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript([
          financialServiceJsonLd({
            name: "Easner Payroll",
            description: payrollContent.metadata.description,
            path: "/payroll",
            serviceType: "Cross-border payroll for contractors and employees",
            areaServed: CORRIDOR_AREA_SERVED,
          }),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Payroll", path: "/payroll" },
          ]),
        ])}
      />
      <ProductPageSections content={payrollContent} />
    </>
  )
}

import Script from "next/script"
import { ProductPageSections } from "@/components/marketing/product-page-sections"
import { checkoutContent } from "@/lib/marketing/content/checkout"
import { marketingMetadata } from "@/lib/marketing/metadata"
import { breadcrumbJsonLd, faqPageJsonLd, financialServiceJsonLd, jsonLdScript } from "@/lib/marketing/structured-data"

export const metadata = marketingMetadata({ metadata: checkoutContent.metadata, path: "/checkout" })

export default function CheckoutPage() {
  return (
    <>
      <Script
        id="easner-checkout-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript([
          financialServiceJsonLd({
            name: "Easner Checkout",
            description: checkoutContent.metadata.description,
            path: "/checkout",
            serviceType: "Merchant of record checkout for platforms",
          }),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Checkout", path: "/checkout" },
          ]),
          ...(checkoutContent.faq ? [faqPageJsonLd(checkoutContent.faq)] : []),
        ])}
      />
      <ProductPageSections content={checkoutContent} />
    </>
  )
}

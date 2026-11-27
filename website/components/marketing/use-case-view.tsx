import { ProductPageSections } from "@/components/marketing/product-page-sections"
import type { UseCasePage } from "@/lib/marketing/content/use-cases"
import { useCasePath } from "@/lib/marketing/content/use-cases"
import { breadcrumbJsonLd, faqPageJsonLd, jsonLdScript, productAnswerJsonLd } from "@/lib/marketing/structured-data"

const PARENT: Record<UseCasePage["parent"], { name: string; path: string }> = {
  connect: { name: "Connect", path: "/connect" },
  business: { name: "Business Banking", path: "/business" },
}

/** A use-case page: the same sections as a product page, with its own definition, steps, facts, and FAQ. */
export function UseCaseView({ page }: { page: UseCasePage }) {
  const path = useCasePath(page)
  const parent = PARENT[page.parent]
  const { content } = page
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript([
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: parent.name, path: parent.path },
            { name: page.linkLabel, path },
          ]),
          ...(content.faq ? [faqPageJsonLd(content.faq)] : []),
          ...productAnswerJsonLd(content, path),
        ])}
      />
      <ProductPageSections content={content} />
    </>
  )
}

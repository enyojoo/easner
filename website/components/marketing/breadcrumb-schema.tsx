import { breadcrumbJsonLd, jsonLdScript } from "@/lib/marketing/structured-data"

/** A BreadcrumbList for pages whose content comes from a component that has no structured data of its own. */
export function BreadcrumbSchema({ segments }: { segments: { name: string; path: string }[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={jsonLdScript([breadcrumbJsonLd([{ name: "Home", path: "/" }, ...segments])])}
    />
  )
}

import type { Metadata } from "next"

export interface MarketingMetadataInput {
  metadata: {
    title: string
    description: string
    keywords?: string[]
  }
  path: string
  titleAbsolute?: string
}

export function marketingMetadata({
  metadata,
  path,
  titleAbsolute,
}: MarketingMetadataInput): Metadata {
  const title = titleAbsolute ? { absolute: titleAbsolute } : metadata.title
  const ogTitle = titleAbsolute ?? `${metadata.title} – Easner`

  return {
    title,
    description: metadata.description,
    keywords: metadata.keywords,
    applicationName: "Easner",
    alternates: { canonical: path },
    openGraph: {
      title: ogTitle,
      description: metadata.description,
      url: path,
      type: "website",
      siteName: "Easner",
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      site: "@easnerbanking",
      title: ogTitle,
      description: metadata.description,
      creator: "@easnerbanking",
    },
  }
}

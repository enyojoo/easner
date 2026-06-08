import type { Metadata } from "next"

export interface MarketingMetadataInput {
  metadata: {
    title: string
    description: string
    keywords?: string[]
  }
  titleAbsolute?: string
}

export function marketingMetadata({
  metadata,
  titleAbsolute,
}: MarketingMetadataInput): Metadata {
  const title = titleAbsolute ? { absolute: titleAbsolute } : metadata.title
  const ogTitle = titleAbsolute ?? `${metadata.title} – Easner`

  return {
    title,
    description: metadata.description,
    keywords: metadata.keywords,
    openGraph: {
      title: ogTitle,
      description: metadata.description,
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: metadata.description,
      creator: "@easnerbanking",
    },
  }
}

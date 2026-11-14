import type { Metadata } from "next"

export interface MarketingArticleMetadata {
  /** ISO 8601. */
  publishedTime: string
  modifiedTime?: string
  /** Author page URLs (absolute). */
  authors?: string[]
  /** The category name. */
  section?: string
}

export interface MarketingMetadataInput {
  metadata: {
    title: string
    description: string
    keywords?: string[]
  }
  path: string
  titleAbsolute?: string
  /** Blog posts: og:type `article` with published/modified times, author and section. */
  article?: MarketingArticleMetadata
  /** Author pages: og:type `profile`. */
  profile?: { firstName: string; lastName?: string; username?: string }
  /** Share image(s), absolute URLs on www.easner.com. Overrides the file-based opengraph-image convention. */
  images?: { url: string; alt: string; width?: number; height?: number }[]
  /** `noindex` for thin archives, draft preview and editor-marked posts. Indexable pages inherit the site default. */
  noindex?: boolean
  /** Extra `<link rel="alternate">` entries, e.g. the RSS feed (`application/rss+xml`) and the Markdown version. */
  alternateTypes?: Record<string, string>
  /** An editor's canonical override for syndicated posts. Defaults to `path`. */
  canonical?: string
}

export function marketingMetadata({
  metadata,
  path,
  titleAbsolute,
  article,
  profile,
  images,
  noindex,
  alternateTypes,
  canonical,
}: MarketingMetadataInput): Metadata {
  const title = titleAbsolute ? { absolute: titleAbsolute } : metadata.title
  const ogTitle = titleAbsolute ?? `${metadata.title} – Easner`
  const socialImages = images?.map((image) => ({ width: 1200, height: 630, ...image }))

  return {
    title,
    description: metadata.description,
    keywords: metadata.keywords,
    applicationName: "Easner",
    alternates: { canonical: canonical ?? path, ...(alternateTypes ? { types: alternateTypes } : {}) },
    ...(noindex ? { robots: { index: false, follow: true } } : {}),
    openGraph: {
      title: ogTitle,
      description: metadata.description,
      url: path,
      siteName: "Easner",
      locale: "en_US",
      ...(article
        ? {
            type: "article" as const,
            publishedTime: article.publishedTime,
            modifiedTime: article.modifiedTime,
            authors: article.authors,
            section: article.section,
          }
        : profile
          ? { type: "profile" as const, ...profile }
          : { type: "website" as const }),
      ...(socialImages ? { images: socialImages } : {}),
    },
    twitter: {
      card: "summary_large_image",
      site: "@easnerbanking",
      title: ogTitle,
      description: metadata.description,
      creator: "@easnerbanking",
      ...(socialImages ? { images: socialImages.map(({ url, alt }) => ({ url, alt })) } : {}),
    },
  }
}

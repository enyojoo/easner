import type { DocNode, ProductSlug } from "@easner/blog-content"

/** A rich-text field (author bio, category intro). Stored as a doc; a plain string is tolerated. */
export type RichField = DocNode | string | null

export interface BlogCategory {
  id: string
  slug: string
  name: string
  description: string | null
  intro: RichField
  ogArtPath: string | null
  sortOrder: number
  seoTitle: string | null
  seoDescription: string | null
}

export interface BlogAuthor {
  id: string
  slug: string
  name: string
  title: string | null
  location: string | null
  avatarPath: string | null
  bio: RichField
  xUrl: string | null
  linkedinUrl: string | null
  githubUrl: string | null
  websiteUrl: string | null
}

export interface FocalPoint {
  x: number
  y: number
}

/** A post as listed: everything but the body. */
export interface BlogPostSummary {
  id: string
  slug: string
  title: string
  excerpt: string
  summary: string | null
  coverPath: string | null
  coverAlt: string | null
  coverFocal: FocalPoint | null
  ogImagePath: string | null
  categoryId: string
  productPage: ProductSlug | null
  featured: boolean
  featuredRank: number | null
  seoTitle: string | null
  seoDescription: string | null
  canonicalUrl: string | null
  noindex: boolean
  focusKeyword: string | null
  wordCount: number
  readingMinutes: number
  publishedAt: string
  /** Drives `dateModified` and the sitemap's lastmod. Null until an editor marks a significant update. */
  contentModifiedAt: string | null
  category: Pick<BlogCategory, "id" | "slug" | "name">
  authors: BlogAuthor[]
}

/** A post with its body. `content` is untrusted until `validateDoc` has passed. */
export interface BlogPost extends BlogPostSummary {
  content: DocNode
  contentText: string
  /** True when the draft (`draft_content`) is being previewed rather than the published doc. */
  isDraft: boolean
}

export interface CategoryWithCount extends BlogCategory {
  postCount: number
  /** Newest post's `content_modified_at ?? published_at`. */
  lastModified: string
}

export interface AuthorWithStats extends BlogAuthor {
  postCount: number
  lastModified: string
  topCategories: { slug: string; name: string; count: number }[]
}

export interface Paged<T> {
  items: T[]
  page: number
  pageCount: number
  total: number
}

export interface SearchHit {
  slug: string
  title: string
  excerpt: string
  categoryName: string
  coverPath: string | null
  coverFocal: FocalPoint | null
  publishedAt: string
  readingMinutes: number
}

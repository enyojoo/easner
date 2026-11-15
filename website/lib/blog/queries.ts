import "server-only"
import { cache } from "react"
import { PRODUCT_PAGES, isValidDoc, validateDoc, type DocNode, type ProductSlug } from "@easner/blog-content"
import {
  AUTHOR_COLUMNS,
  CATEGORY_COLUMNS,
  POST_BODY_COLUMNS,
  POST_EMBEDS,
  POST_LIST_COLUMNS,
} from "./columns"
import {
  BLOG_TAG,
  POSTS_PER_PAGE,
  THIN_ARCHIVE_POSTS,
  authorTag,
  blogSource,
  categoryTag,
  postTag,
} from "./config"
import { FIXTURE_AUTHORS, FIXTURE_CATEGORIES, FIXTURE_POSTS } from "./fixtures/data"
import { harnessDocumentPost } from "./fixtures/harness-doc"
import { rest } from "./supabase"
import type {
  AuthorWithStats,
  BlogAuthor,
  BlogCategory,
  BlogPost,
  BlogPostSummary,
  CategoryWithCount,
  FocalPoint,
  Paged,
  RichField,
  SearchHit,
} from "./types"

// ---------------------------------------------------------------------------------------------------------------
// Row mapping (PostgREST row → model)
// ---------------------------------------------------------------------------------------------------------------

type Row = Record<string, unknown>
const str = (v: unknown): string | null => (typeof v === "string" && v ? v : null)
const rich = (v: unknown): RichField => (typeof v === "string" ? v : v && typeof v === "object" ? (v as DocNode) : null)

/** The database (and the admin) store `product_page` as a path like "/payroll"; the site works in slugs. Accepts either. */
function productSlug(v: unknown): ProductSlug | null {
  const value = str(v)
  if (!value) return null
  const found = (Object.keys(PRODUCT_PAGES) as ProductSlug[]).find((slug) => slug === value || PRODUCT_PAGES[slug].path === value)
  return found ?? null
}

function focal(v: unknown): FocalPoint | null {
  const f = v as { x?: unknown; y?: unknown } | null
  return f && typeof f.x === "number" && typeof f.y === "number" ? { x: f.x, y: f.y } : null
}

function mapCategory(r: Row): BlogCategory {
  return {
    id: String(r.id), slug: String(r.slug), name: String(r.name), description: str(r.description),
    intro: rich(r.intro), ogArtPath: str(r.og_art_path), sortOrder: Number(r.sort_order ?? 0),
    seoTitle: str(r.seo_title), seoDescription: str(r.seo_description),
  }
}

function mapAuthor(r: Row): BlogAuthor {
  return {
    id: String(r.id), slug: String(r.slug), name: String(r.name), title: str(r.title), location: str(r.location),
    avatarPath: str(r.avatar_path), bio: rich(r.bio), xUrl: str(r.x_url), linkedinUrl: str(r.linkedin_url),
    githubUrl: str(r.github_url), websiteUrl: str(r.website_url),
  }
}

function mapPost(r: Row): BlogPostSummary | null {
  const category = r.blog_categories as Row | null
  if (!category) return null
  const links = ((r.blog_post_authors as Row[] | null) ?? [])
    .filter((l) => l.blog_authors)
    .sort((a, b) => Number(a.position) - Number(b.position))
  return {
    id: String(r.id), slug: String(r.slug), title: String(r.title), excerpt: String(r.excerpt ?? ""),
    summary: str(r.summary), coverPath: str(r.cover_path), coverAlt: str(r.cover_alt), coverFocal: focal(r.cover_focal_point),
    ogImagePath: str(r.og_image_path), categoryId: String(r.category_id), productPage: productSlug(r.product_page),
    featured: Boolean(r.featured), featuredRank: typeof r.featured_rank === "number" ? r.featured_rank : null,
    seoTitle: str(r.seo_title), seoDescription: str(r.seo_description), canonicalUrl: str(r.canonical_url),
    noindex: Boolean(r.noindex), focusKeyword: str(r.focus_keyword), wordCount: Number(r.word_count ?? 0),
    readingMinutes: Number(r.reading_minutes ?? 1), publishedAt: String(r.published_at),
    contentModifiedAt: str(r.content_modified_at),
    category: { id: String(category.id), slug: String(category.slug), name: String(category.name) },
    authors: links.map((l) => mapAuthor(l.blog_authors as Row)),
  }
}

const strip = (post: BlogPost): BlogPostSummary => {
  const summary: Partial<BlogPost> = { ...post }
  delete summary.content
  delete summary.contentText
  delete summary.isDraft
  return summary as BlogPostSummary
}

// ---------------------------------------------------------------------------------------------------------------
// Loaders: one place that knows fixtures from Supabase
// ---------------------------------------------------------------------------------------------------------------

const newestFirst = (a: BlogPostSummary, b: BlogPostSummary) => b.publishedAt.localeCompare(a.publishedAt)

/** Every live post, without bodies, newest first. One cached read feeds the index, archives, feeds and sitemap. */
export const getAllPosts = cache(async (): Promise<BlogPostSummary[]> => {
  const source = blogSource()
  if (source === "empty") return []
  if (source === "fixtures") return FIXTURE_POSTS.map(strip).sort(newestFirst)
  const rows = await rest<Row[]>(
    "blog_posts",
    `select=${POST_LIST_COLUMNS},${POST_EMBEDS}&order=published_at.desc&limit=1000`,
    { tags: [BLOG_TAG] },
  )
  return rows.map(mapPost).filter((p): p is BlogPostSummary => p !== null)
})

const getCategoryRows = cache(async (): Promise<BlogCategory[]> => {
  const source = blogSource()
  if (source === "empty") return []
  if (source === "fixtures") return FIXTURE_CATEGORIES
  const rows = await rest<Row[]>(
    "blog_categories",
    `select=${CATEGORY_COLUMNS}&archived_at=is.null&order=sort_order.asc`,
    { tags: [BLOG_TAG] },
  )
  return rows.map(mapCategory)
})

const getAuthorRows = cache(async (): Promise<BlogAuthor[]> => {
  const source = blogSource()
  if (source === "empty") return []
  if (source === "fixtures") return FIXTURE_AUTHORS
  const rows = await rest<Row[]>("blog_authors", `select=${AUTHOR_COLUMNS}&order=name.asc`, { tags: [BLOG_TAG] })
  return rows.map(mapAuthor)
})

const latest = (posts: BlogPostSummary[]) =>
  posts.reduce((max, p) => {
    const d = p.contentModifiedAt ?? p.publishedAt
    return d > max ? d : max
  }, "")

/** Categories that have at least one live post (an empty category is hidden from chips, sitemap and nav, and 404s). */
export const getCategories = cache(async (): Promise<CategoryWithCount[]> => {
  const [categories, posts] = await Promise.all([getCategoryRows(), getAllPosts()])
  return categories
    .map((c) => {
      const mine = posts.filter((p) => p.categoryId === c.id)
      return { ...c, postCount: mine.length, lastModified: latest(mine) }
    })
    .filter((c) => c.postCount > 0)
    .sort((a, b) => a.sortOrder - b.sortOrder)
})

export async function getCategory(slug: string): Promise<CategoryWithCount | null> {
  const source = blogSource()
  const posts = await getAllPosts()
  let category: BlogCategory | undefined
  if (source === "supabase") {
    const rows = await rest<Row[]>(
      "blog_categories",
      `select=${CATEGORY_COLUMNS}&slug=eq.${encodeURIComponent(slug)}&archived_at=is.null&limit=1`,
      { tags: [BLOG_TAG, categoryTag(slug)] },
    )
    category = rows[0] ? mapCategory(rows[0]) : undefined
  } else {
    category = (await getCategoryRows()).find((c) => c.slug === slug)
  }
  if (!category) return null
  const mine = posts.filter((p) => p.categoryId === category!.id)
  if (mine.length === 0) return null
  return { ...category, postCount: mine.length, lastModified: latest(mine) }
}

/** Authors with at least one live post. */
export const getAuthors = cache(async (): Promise<AuthorWithStats[]> => {
  const [authors, posts, categories] = await Promise.all([getAuthorRows(), getAllPosts(), getCategoryRows()])
  return authors
    .map((a) => authorStats(a, posts, categories))
    .filter((a) => a.postCount > 0)
    .sort((a, b) => b.postCount - a.postCount || a.name.localeCompare(b.name))
})

function authorStats(a: BlogAuthor, posts: BlogPostSummary[], categories: BlogCategory[]): AuthorWithStats {
  const mine = posts.filter((p) => p.authors.some((x) => x.id === a.id))
  const counts = new Map<string, number>()
  for (const p of mine) counts.set(p.categoryId, (counts.get(p.categoryId) ?? 0) + 1)
  const topCategories = [...counts.entries()]
    .sort((x, y) => y[1] - x[1])
    .map(([id, count]) => ({ category: categories.find((c) => c.id === id), count }))
    .filter((c): c is { category: BlogCategory; count: number } => Boolean(c.category))
    .map(({ category, count }) => ({ slug: category.slug, name: category.name, count }))
  return { ...a, postCount: mine.length, lastModified: latest(mine), topCategories }
}

export async function getAuthor(slug: string): Promise<AuthorWithStats | null> {
  const source = blogSource()
  const [posts, categories] = await Promise.all([getAllPosts(), getCategoryRows()])
  let author: BlogAuthor | undefined
  if (source === "supabase") {
    const rows = await rest<Row[]>(
      "blog_authors",
      `select=${AUTHOR_COLUMNS}&slug=eq.${encodeURIComponent(slug)}&limit=1`,
      { tags: [BLOG_TAG, authorTag(slug)] },
    )
    author = rows[0] ? mapAuthor(rows[0]) : undefined
  } else {
    author = (await getAuthorRows()).find((a) => a.slug === slug)
  }
  if (!author) return null
  const stats = authorStats(author, posts, categories)
  return stats.postCount > 0 ? stats : null
}

// ---------------------------------------------------------------------------------------------------------------
// A single post
// ---------------------------------------------------------------------------------------------------------------

export class InvalidPostError extends Error {}

/**
 * One post with its body. Runs `validateDoc` first: a post whose document fails is logged and treated as missing
 * (the page 404s), because the renderer renders nothing the format rejects. With `draft`, reads the unpublished
 * working copy with the service role (preview only, never cached).
 */
export async function getPost(slug: string, options: { draft?: boolean } = {}): Promise<BlogPost | null> {
  const source = blogSource()
  if (!options.draft && source === "empty") return null
  let post: BlogPost | null = null

  if (options.draft && process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const rows = await rest<Row[]>(
      "blog_posts",
      `select=${POST_BODY_COLUMNS.replace("content,content_text", "content,draft_content,content_text")},${POST_EMBEDS}&slug=eq.${encodeURIComponent(slug)}&limit=1`,
      { role: "service", noStore: true },
    )
    const row = rows[0]
    const base = row && mapPost(row)
    if (row && base) {
      const content = (row.draft_content ?? row.content) as DocNode
      post = { ...base, content, contentText: String(row.content_text ?? ""), isDraft: row.draft_content != null }
    }
  } else if (source === "fixtures") {
    post = FIXTURE_POSTS.find((p) => p.slug === slug) ?? harnessDocumentPost(slug)
  } else if (source === "supabase") {
    const rows = await rest<Row[]>(
      "blog_posts",
      `select=${POST_BODY_COLUMNS},${POST_EMBEDS}&slug=eq.${encodeURIComponent(slug)}&limit=1`,
      { tags: [BLOG_TAG, postTag(slug)] },
    )
    const row = rows[0]
    const base = row && mapPost(row)
    if (row && base) post = { ...base, content: row.content as DocNode, contentText: String(row.content_text ?? ""), isDraft: false }
  }
  if (!post) return null

  if (!isValidDoc(post.content)) {
    const errors = validateDoc(post.content).filter((i) => i.severity === "error")
    console.error(`[blog] post "${slug}" has an invalid document and is not rendered:`, JSON.stringify(errors.slice(0, 5)))
    return null
  }
  return post
}

/** Slugs to prerender at build. Posts that fail validation are skipped by the page itself (404). */
export async function getPostSlugs(): Promise<string[]> {
  return (await getAllPosts()).map((p) => p.slug)
}

// ---------------------------------------------------------------------------------------------------------------
// Lists, pages, related, featured
// ---------------------------------------------------------------------------------------------------------------

export function paginate<T>(items: T[], page: number, perPage = POSTS_PER_PAGE): Paged<T> {
  const pageCount = Math.max(1, Math.ceil(items.length / perPage))
  const current = Math.min(Math.max(1, page), pageCount)
  return { items: items.slice((current - 1) * perPage, current * perPage), page: current, pageCount, total: items.length }
}

/** Up to 3 featured posts (editor-picked by `featured_rank`), topped up with the newest. */
export function pickFeatured(posts: BlogPostSummary[]): BlogPostSummary[] {
  const picked = posts
    .filter((p) => p.featured)
    .sort((a, b) => (a.featuredRank ?? 99) - (b.featuredRank ?? 99) || newestFirst(a, b))
    .slice(0, 3)
  if (picked.length >= 3) return picked
  const rest = posts.filter((p) => !picked.includes(p))
  return [...picked, ...rest].slice(0, 3)
}

/**
 * Rank candidates for a post's "Related reading": same `product_page` first, then same category, then recency.
 * Pure, so it is unit-testable and shared by the fixtures and Supabase paths. The current post is never included.
 */
export function rankRelated(post: BlogPostSummary, posts: BlogPostSummary[], count = 3): BlogPostSummary[] {
  const score = (p: BlogPostSummary) =>
    (post.productPage && p.productPage === post.productPage ? 2 : 0) + (p.categoryId === post.categoryId ? 1 : 0)
  return posts
    .filter((p) => p.id !== post.id)
    .sort((a, b) => score(b) - score(a) || newestFirst(a, b))
    .slice(0, count)
}

/**
 * Three related posts. Reads the one cached, `blog`-tagged list of live posts (explicit columns), so a publish, edit or
 * unpublish (which revalidates `blog`) refreshes every post's related row.
 */
export async function getRelated(post: BlogPostSummary, count = 3): Promise<BlogPostSummary[]> {
  return rankRelated(post, await getAllPosts(), count)
}

/**
 * Latest posts linked to a product page (`product_page`), for the product page's "Related reading". Never throws:
 * product pages are static and must still build and render when Supabase is unreachable, so a failure logs and returns [].
 */
export async function getPostsForProduct(product: ProductSlug, count = 3): Promise<BlogPostSummary[]> {
  try {
    return (await getAllPosts()).filter((p) => p.productPage === product).slice(0, count)
  } catch (error) {
    console.error(`[blog] related reading for ${product} unavailable`, error)
    return []
  }
}

export async function getPostsByCategory(categoryId: string): Promise<BlogPostSummary[]> {
  return (await getAllPosts()).filter((p) => p.categoryId === categoryId)
}

export async function getPostsByAuthor(authorId: string): Promise<BlogPostSummary[]> {
  return (await getAllPosts()).filter((p) => p.authors.some((a) => a.id === authorId))
}

export const isThinArchive = (postCount: number) => postCount < THIN_ARCHIVE_POSTS

/** A post is indexable unless an editor said otherwise. */
export const isIndexable = (post: Pick<BlogPostSummary, "noindex">) => !post.noindex

// ---------------------------------------------------------------------------------------------------------------
// Redirects and search
// ---------------------------------------------------------------------------------------------------------------

function toHit(p: BlogPostSummary): SearchHit {
  return {
    slug: p.slug, title: p.title, excerpt: p.excerpt, categoryName: p.category.name, coverPath: p.coverPath,
    coverFocal: p.coverFocal, publishedAt: p.publishedAt, readingMinutes: p.readingMinutes,
  }
}

/** Postgres full-text search on the generated `search` column (title, excerpt, plain-text body). */
export async function searchPosts(query: string, limit = 8): Promise<SearchHit[]> {
  const q = query.trim().slice(0, 100)
  if (!q) return []
  const source = blogSource()
  if (source === "empty") return []
  if (source === "fixtures") {
    const words = q.toLowerCase().split(/\s+/).filter(Boolean)
    return FIXTURE_POSTS.map((p) => {
      const hay = `${p.title} ${p.excerpt} ${p.contentText}`.toLowerCase()
      const score = words.reduce((n, w) => n + (hay.includes(w) ? 1 : 0) + (p.title.toLowerCase().includes(w) ? 2 : 0), 0)
      return { p, score }
    })
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score || newestFirst(a.p, b.p))
      .slice(0, limit)
      .map((x) => toHit(strip(x.p)))
  }
  const rows = await rest<Row[]>(
    "blog_posts",
    `select=${POST_LIST_COLUMNS},${POST_EMBEDS}&search=wfts(english).${encodeURIComponent(q)}&order=published_at.desc&limit=${limit}`,
    { tags: [BLOG_TAG], revalidate: 300 },
  )
  return rows.map(mapPost).filter((p): p is BlogPostSummary => p !== null).map(toHit)
}

import { BLOG_PATH, SITE } from "./config"

export const postPath = (slug: string) => `${BLOG_PATH}/${slug}`
export const categoryPath = (slug: string) => `${BLOG_PATH}/categories/${slug}`
export const authorPath = (slug: string) => `${BLOG_PATH}/authors/${slug}`
export const authorsPath = `${BLOG_PATH}/authors`
export const markdownPath = (slug: string) => `${BLOG_PATH}/${slug}.md`
export const abs = (path: string) => `${SITE}${path}`

/** `?page=N` for page 2 and up; page 1 is the clean URL. */
export const pagePath = (base: string, page: number) => (page > 1 ? `${base}?page=${page}` : base)

/** Public URL of a stored image. Paths starting with "/" are files in /public (fixtures). */
export function mediaUrl(path: string): string {
  if (path.startsWith("/") || /^https?:\/\//.test(path)) return path
  const base = (process.env.SUPABASE_URL ?? "").replace(/\/$/, "")
  return `${base}/storage/v1/object/public/blog/${path}`
}

/** Short stable hash. Goes in `?v=` so platforms re-fetch a share image after the cover changes. */
export function contentHash(value: string): string {
  let h = 2166136261
  for (let i = 0; i < value.length; i++) {
    h ^= value.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return (h >>> 0).toString(36)
}

export type CropName = "16x9" | "4x3" | "1x1"
export const CROPS: Record<CropName, { width: number; height: number }> = {
  "16x9": { width: 1600, height: 900 },
  "4x3": { width: 1200, height: 900 },
  "1x1": { width: 1200, height: 1200 },
}
export const SHARE_SIZE = { width: 1200, height: 630 }

interface ImageSource {
  slug: string
  coverPath: string | null
  ogImagePath: string | null
}

/** The share image, on www.easner.com: cover cropped to 1200×630, or `og_image_path`, or the text card. */
export function shareImageUrl(post: ImageSource): string {
  return abs(`${postPath(post.slug)}/opengraph-image?v=${contentHash(post.ogImagePath ?? post.coverPath ?? "text")}`)
}

/** Cover crops for `BlogPosting.image`, on www.easner.com. Empty when the post has no cover. */
export function cropImageUrl(post: ImageSource, crop: CropName): string | null {
  return post.coverPath ? abs(`${postPath(post.slug)}/image/${crop}?v=${contentHash(post.coverPath)}`) : null
}

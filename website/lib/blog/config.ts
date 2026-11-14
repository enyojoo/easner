/** Site-wide blog constants and the data-source switch. */

export const SITE = "https://www.easner.com"
export const BLOG_PATH = "/blog"
export const POSTS_PER_PAGE = 9
/** An archive with fewer live posts than this is `noindex` and left out of the sitemap. */
export const THIN_ARCHIVE_POSTS = 3
export const BLOG_TAG = "blog"
export const postTag = (slug: string) => `blog:post:${slug}`
export const categoryTag = (slug: string) => `blog:category:${slug}`
export const authorTag = (slug: string) => `blog:author:${slug}`
export const BLOG_REVALIDATE_SECONDS = 3600

export type BlogSource = "fixtures" | "supabase" | "empty"

/**
 * Where posts come from. `BLOG_FIXTURES=1` always reads lib/blog/fixtures. With no `SUPABASE_URL` the blog is empty
 * (a production build with no env still passes and shows the empty states), except in development, where it falls
 * back to the fixtures so the design can be worked on without a database.
 */
export function blogSource(): BlogSource {
  if (process.env.BLOG_FIXTURES === "1") return "fixtures"
  if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) return "supabase"
  return process.env.NODE_ENV === "development" ? "fixtures" : "empty"
}

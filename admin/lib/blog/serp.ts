export const META_TITLE_RANGE: readonly [number, number] = [30, 60]
export const META_DESCRIPTION_RANGE: readonly [number, number] = [70, 155]
export const EXCERPT_RECOMMENDED_MAX = 155
export const SITE_TITLE_SUFFIX = " – Easner"
export const BLOG_URL_BASE = "www.easner.com/blog"

/** Site template `%s – Easner`; a title that already says Easner is used as is (titleAbsolute). */
export function finalTitle(title: string, seoTitle?: string | null): { text: string; absolute: boolean } {
  const base = (seoTitle?.trim() || title.trim()) || ""
  const absolute = /easner/i.test(base)
  return { text: absolute || !base ? base : `${base}${SITE_TITLE_SUFFIX}`, absolute }
}

export type LengthState = "empty" | "short" | "ok" | "long"

export function lengthState(text: string | null | undefined, [min, max]: readonly [number, number]): LengthState {
  const n = (text ?? "").trim().length
  if (n === 0) return "empty"
  if (n < min) return "short"
  if (n > max) return "long"
  return "ok"
}

export interface SerpInput {
  title: string
  seoTitle?: string | null
  seoDescription?: string | null
  excerpt?: string | null
  summary?: string | null
  slug: string
}

/** What Google would show: the description falls back to the summary, then the excerpt. */
export function serpPreview(input: SerpInput): { title: string; url: string; description: string } {
  const description = input.seoDescription?.trim() || input.summary?.trim() || input.excerpt?.trim() || ""
  return {
    title: finalTitle(input.title, input.seoTitle).text,
    url: `${BLOG_URL_BASE}/${input.slug}`,
    description: description.length > 160 ? `${description.slice(0, 157).trimEnd()}…` : description,
  }
}

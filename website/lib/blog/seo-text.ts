import { plainText, type DocNode } from "@easner/blog-content"
import type { AuthorWithStats, CategoryWithCount } from "./types"

const oneLine = (text: string) => text.replace(/\s+/g, " ").trim()
export const richPlain = (value: DocNode | string | null) =>
  value ? oneLine(typeof value === "string" ? value : plainText(value)) : ""

/** Category meta: the admin's SEO fields first, then the description, then the intro. */
export function categoryMeta(category: CategoryWithCount, page: number) {
  const base = category.seoTitle ?? category.name
  const description =
    category.seoDescription ?? (category.description || richPlain(category.intro)) ?? `Easner blog posts about ${category.name}.`
  return {
    title: page > 1 ? `${base} – page ${page}` : base,
    description: page > 1 ? `${description} Page ${page}.` : description,
  }
}

export function authorMeta(author: AuthorWithStats, page: number) {
  const topic = author.topCategories.slice(0, 2).map((c) => c.name)
  const bio = richPlain(author.bio)
  const role = [author.title, author.location].filter(Boolean).join(", ")
  const description = `${author.name}${role ? `, ${role}` : ""}. ${bio || `${author.postCount} ${author.postCount === 1 ? "post" : "posts"} on the Easner blog${topic.length ? ` about ${topic.join(" and ")}` : ""}.`}`
  return {
    title: page > 1 ? `Posts by ${author.name} – page ${page}` : `Posts by ${author.name}`,
    description: page > 1 ? `${description} Page ${page}.` : description,
  }
}

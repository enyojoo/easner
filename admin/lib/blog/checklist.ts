import {
  extractImages,
  internalLinks,
  linkedProductPages,
  plainText,
  validateDoc,
  type AnyNode,
} from "@easner/blog-content"
import { lintDoc } from "./brand-lint.ts"
import { isKnownPath } from "./site-routes.ts"
import {
  META_DESCRIPTION_RANGE,
  META_TITLE_RANGE,
  finalTitle,
  lengthState,
} from "./serp.ts"

export type ChecklistSeverity = "error" | "warning" | "pass"
export interface ChecklistItem {
  id: string
  severity: ChecklistSeverity
  title: string
  detail: string
  action?: { label: string; target: "post" | "seo" | "editor" | "cover" | "authors"; at?: number[] }
}

export interface ChecklistPost {
  title: string
  slug: string
  seo_title: string | null
  seo_description: string | null
  excerpt: string | null
  cover_path: string | null
  cover_alt: string | null
  category_id: string | null
  product_page?: string | null
  status?: string
  published_at?: string | null
  claims_flagged?: boolean
}
export interface ChecklistAuthor {
  id: string
  name: string
  title?: string | null
  avatar_path?: string | null
  bio?: unknown
}
export interface ChecklistOtherPost {
  id: string
  slug: string
  title: string
  seo_title: string | null
  seo_description: string | null
}
export interface ChecklistInput {
  post: ChecklistPost & { id?: string }
  doc: AnyNode
  authors: ChecklistAuthor[]
  otherPosts: ChecklistOtherPost[]
  knownPaths: string[]
  publishedSlugs: string[]
}
export interface ChecklistResult {
  items: ChecklistItem[]
  errors: number
  warnings: number
  canPublish: boolean
}

const norm = (s: string | null | undefined) => (s ?? "").trim().toLowerCase().replace(/\s+/g, " ")
const hasBio = (bio: unknown) => {
  if (!bio) return false
  if (typeof bio === "string") return bio.trim().length > 0
  return plainText(bio as AnyNode).trim().length > 0
}

export function runChecklist(input: ChecklistInput): ChecklistResult {
  const { post, doc, authors, otherPosts, knownPaths, publishedSlugs } = input
  const items: ChecklistItem[] = []
  const add = (item: ChecklistItem) => items.push(item)
  const others = otherPosts.filter((p) => p.slug !== post.slug && (!post.id || p.id !== post.id))
  const summaryBlock = (doc.content ?? []).find((b) => b.type === "summary")
  const summary = summaryBlock ? plainText(summaryBlock).replace(/\s+/g, " ").trim() : ""
  const title = post.title.trim()

  // Title
  add(
    title
      ? { id: "title", severity: "pass", title: "Title", detail: "The post has a title." }
      : { id: "title", severity: "error", title: "Add a title", detail: "A post needs a title.", action: { label: "Open the editor", target: "editor" } },
  )

  // Meta title: range, unique, Easner at most once
  const final = finalTitle(post.title, post.seo_title)
  const metaBase = (post.seo_title?.trim() || title)
  const titleState = lengthState(metaBase, META_TITLE_RANGE)
  if (titleState === "short" || titleState === "long" || titleState === "empty") {
    add({
      id: "meta-title-length",
      severity: titleState === "empty" ? "error" : "warning",
      title: "Meta title length",
      detail: titleState === "short" ? `Under ${META_TITLE_RANGE[0]} characters.` : titleState === "long" ? `Over ${META_TITLE_RANGE[1]} characters; Google may cut it.` : "There is no title to show in search.",
      action: { label: "Edit in SEO", target: "seo" },
    })
  } else add({ id: "meta-title-length", severity: "pass", title: "Meta title length", detail: `${metaBase.length} characters.` })

  const easnerCount = (final.text.match(/easner/gi) ?? []).length
  add(
    easnerCount > 1
      ? { id: "easner-once", severity: "error", title: "“Easner” once in the title", detail: `The title shows “Easner” ${easnerCount} times: “${final.text}”.`, action: { label: "Edit in SEO", target: "seo" } }
      : { id: "easner-once", severity: "pass", title: "“Easner” once in the title", detail: `Shown as “${final.text}”.` },
  )

  const dupTitle = others.find((p) => norm(p.seo_title || p.title) === norm(metaBase) && norm(metaBase) !== "")
  add(
    dupTitle
      ? { id: "title-unique", severity: "error", title: "Meta title is unique", detail: `“${dupTitle.title || dupTitle.slug}” uses the same title.`, action: { label: "Edit in SEO", target: "seo" } }
      : { id: "title-unique", severity: "pass", title: "Meta title is unique", detail: "No other post uses it." },
  )

  // Description
  const description = post.seo_description?.trim() || summary || post.excerpt?.trim() || ""
  const descState = lengthState(description, META_DESCRIPTION_RANGE)
  if (descState === "empty") {
    add({ id: "meta-description-length", severity: "error", title: "Meta description", detail: "Add a meta description, an excerpt or a Summary block.", action: { label: "Edit in SEO", target: "seo" } })
  } else if (descState !== "ok") {
    add({
      id: "meta-description-length",
      severity: "warning",
      title: "Meta description length",
      detail: descState === "short" ? `Under ${META_DESCRIPTION_RANGE[0]} characters.` : `Over ${META_DESCRIPTION_RANGE[1]} characters; Google may cut it.`,
      action: { label: "Edit in SEO", target: "seo" },
    })
  } else add({ id: "meta-description-length", severity: "pass", title: "Meta description length", detail: `${description.length} characters.` })

  if (description) {
    const dupDesc = others.find((p) => norm(p.seo_description) !== "" && norm(p.seo_description) === norm(description))
    add(
      dupDesc
        ? { id: "description-unique", severity: "error", title: "Meta description is unique", detail: `“${dupDesc.title || dupDesc.slug}” uses the same description.`, action: { label: "Edit in SEO", target: "seo" } }
        : { id: "description-unique", severity: "pass", title: "Meta description is unique", detail: "No other post uses it." },
    )
  }

  // One H1
  const h1 = (doc.content ?? []).filter((b) => b.type === "heading" && b.attrs?.level === 1).length
  add(
    h1
      ? { id: "one-h1", severity: "error", title: "One H1", detail: "The post title is the H1. Use H2 to H4 in the body.", action: { label: "Open the editor", target: "editor" } }
      : { id: "one-h1", severity: "pass", title: "One H1", detail: "The title is the page’s only H1." },
  )

  // Cover
  if (!post.cover_path) add({ id: "cover", severity: "error", title: "Cover image", detail: "A cover is required. It is also the share image.", action: { label: "Add a cover", target: "cover" } })
  else if (!post.cover_alt?.trim()) add({ id: "cover", severity: "error", title: "Cover alt text", detail: "Describe the cover for readers using screen readers.", action: { label: "Add alt text", target: "cover" } })
  else add({ id: "cover", severity: "pass", title: "Cover with alt text", detail: "The cover has alt text." })

  // Image alt
  const images = extractImages(doc)
  const noAlt = images.filter((i) => !i.alt.trim()).length
  add(
    noAlt
      ? { id: "image-alt", severity: "error", title: "Alt text on every image", detail: `${noAlt} ${noAlt === 1 ? "image has" : "images have"} no alt text.`, action: { label: "Open the editor", target: "editor" } }
      : { id: "image-alt", severity: "pass", title: "Alt text on every image", detail: images.length ? `${images.length} ${images.length === 1 ? "image" : "images"} checked.` : "No images in the body." },
  )

  // Category
  add(
    post.category_id
      ? { id: "category", severity: "pass", title: "Category", detail: "A category is set." }
      : { id: "category", severity: "error", title: "Category", detail: "Choose a category.", action: { label: "Open Post settings", target: "post" } },
  )

  // Authors
  if (!authors.length) add({ id: "authors", severity: "error", title: "Author", detail: "Add at least one author.", action: { label: "Open Post settings", target: "authors" } })
  else {
    // Photo, title and bio, and who is missing what.
    const gaps = authors
      .map((a) => ({ name: a.name, missing: [!a.avatar_path && "a photo", !a.title?.trim() && "a title", !hasBio(a.bio) && "a bio"].filter(Boolean) as string[] }))
      .filter((g) => g.missing.length)
    const list = (items: string[]) => (items.length > 1 ? `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}` : items[0])
    add(
      gaps.length
        ? { id: "authors", severity: "error", title: "Author profile complete", detail: gaps.map((g) => `${g.name} needs ${list(g.missing)}.`).join(" "), action: { label: "Open authors", target: "authors" } }
        : { id: "authors", severity: "pass", title: "Author profile complete", detail: authors.map((a) => a.name).join(", ") },
    )
  }

  // Internal links
  const known = new Set(knownPaths)
  const broken = internalLinks(doc).filter((p) => !known.has(p) && !isKnownPath(p, publishedSlugs))
  add(
    broken.length
      ? { id: "links", severity: "error", title: "Internal links resolve", detail: `Not found on the site: ${broken.slice(0, 3).join(", ")}${broken.length > 3 ? ` and ${broken.length - 3} more` : ""}.`, action: { label: "Open the editor", target: "editor" } }
      : { id: "links", severity: "pass", title: "Internal links resolve", detail: "Every internal link goes to a real page." },
  )

  // Product page link
  const products = linkedProductPages(doc)
  add(
    products.length
      ? { id: "product-link", severity: "pass", title: "Links to a product page", detail: products.join(", ") }
      : { id: "product-link", severity: "error", title: "Link to a product page", detail: "Link at least one product page, for example with a product card.", action: { label: "Open the editor", target: "editor" } },
  )

  // Document validity
  const issues = validateDoc(doc)
  const docErrors = issues.filter((i) => i.severity === "error")
  const docWarnings = issues.filter((i) => i.severity === "warning" && i.code !== "image-alt-missing")
  if (docErrors.length) add({ id: "doc-valid", severity: "error", title: "Content is valid", detail: docErrors[0].message, action: { label: "Open the editor", target: "editor", at: docErrors[0].path } })
  else if (docWarnings.length) add({ id: "doc-valid", severity: "warning", title: "Content structure", detail: docWarnings[0].message, action: { label: "Open the editor", target: "editor", at: docWarnings[0].path } })
  else add({ id: "doc-valid", severity: "pass", title: "Content is valid", detail: "The document passed validation." })

  // Brand voice (title and excerpt included)
  const brand = [...lintDoc(doc)]
  const brandErrors = brand.filter((b) => b.severity === "error")
  const brandWarnings = brand.filter((b) => b.severity === "warning")
  const sample = (list: typeof brand) => list.slice(0, 3).map((b) => `“${b.match}”`).join(", ")
  if (brandErrors.length) add({ id: "brand-errors", severity: "error", title: "Brand voice", detail: `${brandErrors.length} banned ${brandErrors.length === 1 ? "phrase" : "phrases"}: ${sample(brandErrors)}.`, action: { label: "Open the editor", target: "editor", at: brandErrors[0].path } })
  if (brandWarnings.length) add({ id: "brand-warnings", severity: "warning", title: "Brand voice to look at", detail: `${sample(brandWarnings)}${brandWarnings.length > 3 ? ` and ${brandWarnings.length - 3} more` : ""}.`, action: { label: "Open the editor", target: "editor", at: brandWarnings[0].path } })
  if (!brand.length) add({ id: "brand", severity: "pass", title: "Brand voice", detail: "No banned words or missing qualifiers." })

  // Claims
  if (post.claims_flagged) {
    add({ id: "claims", severity: "warning", title: "Claims check", detail: "A second Editor has to approve this post before it goes live." })
  }

  const errors = items.filter((i) => i.severity === "error").length
  const warnings = items.filter((i) => i.severity === "warning").length
  return { items, errors, warnings, canPublish: errors === 0 }
}

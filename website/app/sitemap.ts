import type { MetadataRoute } from "next"
import { getAllPosts, getAuthors, getCategories, isThinArchive } from "@/lib/blog/queries"
import { aiProductPages } from "@/lib/marketing/content/ai"
import { comparePages, comparePath } from "@/lib/marketing/content/compare"
import { useCasePages, useCasePath } from "@/lib/marketing/content/use-cases"
import { authorPath, authorsPath, categoryPath, cropImageUrl, postPath } from "@/lib/blog/urls"

export const revalidate = 3600

const baseUrl = "https://www.easner.com"

/**
 * Bump a route's date when its content materially changes – a static date is a real
 * "last modified" signal to crawlers; `new Date()` on every build defeats that.
 */
const lastModified = {
  home: new Date("2026-11-27"),
  checkout: new Date("2026-11-27"),
  paymentLinks: new Date("2026-11-27"),
  payroll: new Date("2026-11-27"),
  connect: new Date("2026-11-27"),
  personal: new Date("2026-11-27"),
  cards: new Date("2026-11-27"),
  about: new Date("2026-09-05"),
  contact: new Date("2026-06-06"),
  terms: new Date("2026-11-19"),
  privacy: new Date("2026-11-14"),
  compliance: new Date("2026-11-19"),
  deleteAccount: new Date("2026-11-06"),
  business: new Date("2026-11-27"),
  stablecoin: new Date("2026-11-27"),
  invoicing: new Date("2026-11-27"),
  whiteLabel: new Date("2026-11-27"),
  developers: new Date("2026-11-27"),
  app: new Date("2026-09-05"),
  answers: new Date("2026-11-27"),
  pricing: new Date("2026-11-22"),
  legalIndex: new Date("2026-11-19"),
  legalPartners: new Date("2026-11-19"),
  legalBundle: new Date("2026-11-06"),
  /** The blog index before it has a post. Afterwards it follows its newest post. */
  blog: new Date("2026-11-14"),
}

/** An author or post with no usable timestamp must not reach `toISOString` (`new Date("")` is Invalid Date). */
function modified(value: string | null | undefined, fallback: Date): Date {
  if (!value) return fallback
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? fallback : date
}

/** Blog URLs from the data layer, with each page's real last-modified date (never `new Date()`) and cover images. */
async function blogEntries(): Promise<MetadataRoute.Sitemap> {
  const [posts, categories, authors] = await Promise.all([getAllPosts(), getCategories(), getAuthors()])
  const indexable = posts.filter((p) => !p.noindex)
  const newest = indexable.reduce((max, p) => {
    const d = p.contentModifiedAt ?? p.publishedAt
    return d > max ? d : max
  }, "")
  return [
    { url: `${baseUrl}/blog`, lastModified: modified(newest, lastModified.blog), changeFrequency: "weekly", priority: 0.7 },
    ...indexable.map((p) => {
      const image = cropImageUrl(p, "16x9")
      return {
        url: `${baseUrl}${postPath(p.slug)}`,
        lastModified: modified(p.contentModifiedAt ?? p.publishedAt, lastModified.blog),
        changeFrequency: "monthly" as const,
        priority: 0.6,
        ...(image ? { images: [image] } : {}),
      }
    }),
    // Thin archives (too few posts) are noindex and stay out of the sitemap.
    ...categories
      .filter((c) => !isThinArchive(c.postCount))
      .map((c) => ({ url: `${baseUrl}${categoryPath(c.slug)}`, lastModified: modified(c.lastModified, lastModified.blog), changeFrequency: "weekly" as const, priority: 0.5 })),
    {
      url: `${baseUrl}${authorsPath}`,
      lastModified: modified(authors.reduce((m, a) => (a.lastModified > m ? a.lastModified : m), ""), lastModified.blog),
      changeFrequency: "monthly" as const,
      priority: 0.4,
    },
    ...authors.filter((a) => a.postCount > 0).map((a) => ({ url: `${baseUrl}${authorPath(a.slug)}`, lastModified: modified(a.lastModified, lastModified.blog), changeFrequency: "monthly" as const, priority: 0.4 })),
  ]
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return [
    ...staticEntries(),
    ...(await blogEntries()),
  ]
}

function staticEntries(): MetadataRoute.Sitemap {
  return [
    { url: baseUrl, lastModified: lastModified.home, changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/contact`, lastModified: lastModified.contact, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/about`, lastModified: lastModified.about, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/terms`, lastModified: lastModified.terms, changeFrequency: "yearly", priority: 0.5 },
    { url: `${baseUrl}/privacy`, lastModified: lastModified.privacy, changeFrequency: "yearly", priority: 0.5 },
    { url: `${baseUrl}/delete-account`, lastModified: lastModified.deleteAccount, changeFrequency: "yearly", priority: 0.5 },
    { url: `${baseUrl}/compliance`, lastModified: lastModified.compliance, changeFrequency: "yearly", priority: 0.5 },
    { url: `${baseUrl}/legal`, lastModified: lastModified.legalIndex, changeFrequency: "yearly", priority: 0.5 },
    { url: `${baseUrl}/legal/partners`, lastModified: lastModified.legalPartners, changeFrequency: "yearly", priority: 0.45 },
    { url: `${baseUrl}/legal/law-enforcement`, lastModified: lastModified.legalBundle, changeFrequency: "yearly", priority: 0.45 },
    {
      url: `${baseUrl}/legal/disclosures`,
      lastModified: lastModified.legalBundle,
      changeFrequency: "yearly",
      priority: 0.45,
    },
    {
      url: `${baseUrl}/legal/disclosures/personal-banking`,
      lastModified: lastModified.legalBundle,
      changeFrequency: "yearly",
      priority: 0.45,
    },
    {
      url: `${baseUrl}/legal/disclosures/business-banking`,
      lastModified: lastModified.legalBundle,
      changeFrequency: "yearly",
      priority: 0.45,
    },
    {
      url: `${baseUrl}/legal/disclosures/digital-assets`,
      lastModified: lastModified.legalBundle,
      changeFrequency: "yearly",
      priority: 0.45,
    },
    { url: `${baseUrl}/personal`, lastModified: lastModified.personal, changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/app`, lastModified: lastModified.app, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/business`, lastModified: lastModified.business, changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/checkout`, lastModified: lastModified.checkout, changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/payment-links`, lastModified: lastModified.paymentLinks, changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/payroll`, lastModified: lastModified.payroll, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/connect`, lastModified: lastModified.connect, changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/stablecoin`, lastModified: lastModified.stablecoin, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/invoicing`, lastModified: lastModified.invoicing, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/cards`, lastModified: lastModified.cards, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/white-label`, lastModified: lastModified.whiteLabel, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/developers`, lastModified: lastModified.developers, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/answers`, lastModified: lastModified.answers, changeFrequency: "weekly", priority: 0.7 },
    ...useCasePages.map((page) => ({
      url: `${baseUrl}${useCasePath(page)}`,
      lastModified: lastModified.answers,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    { url: `${baseUrl}/compare`, lastModified: lastModified.answers, changeFrequency: "monthly", priority: 0.7 },
    ...comparePages.map((page) => ({
      url: `${baseUrl}${comparePath(page)}`,
      lastModified: new Date(`${page.lastChecked}T00:00:00Z`),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...aiProductPages.map((section) => ({
      url: `${baseUrl}/answers${section.href}`,
      lastModified: lastModified.answers,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    { url: `${baseUrl}/pricing`, lastModified: lastModified.pricing, changeFrequency: "monthly", priority: 0.9 },
  ]
}

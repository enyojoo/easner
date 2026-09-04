import type { MetadataRoute } from "next"

const baseUrl = "https://www.easner.com"

/**
 * Bump a route's date when its content materially changes — a static date is a real
 * "last modified" signal to crawlers; `new Date()` on every build defeats that.
 */
const lastModified = {
  home: new Date("2026-09-04"),
  checkout: new Date("2026-09-04"),
  paymentLinks: new Date("2026-09-04"),
  payroll: new Date("2026-09-04"),
  personal: new Date("2026-09-04"),
  cards: new Date("2026-09-04"),
  about: new Date("2026-06-08"),
  contact: new Date("2026-06-06"),
  legal: new Date("2026-06-08"),
  business: new Date("2026-08-26"),
  stablecoin: new Date("2026-08-26"),
  invoicing: new Date("2026-08-26"),
  partners: new Date("2026-08-26"),
  developers: new Date("2026-08-26"),
  app: new Date("2026-08-28"),
}

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: baseUrl, lastModified: lastModified.home, changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/contact`, lastModified: lastModified.contact, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/about`, lastModified: lastModified.about, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/terms`, lastModified: lastModified.legal, changeFrequency: "yearly", priority: 0.5 },
    { url: `${baseUrl}/privacy`, lastModified: lastModified.legal, changeFrequency: "yearly", priority: 0.5 },
    { url: `${baseUrl}/delete-account`, lastModified: lastModified.legal, changeFrequency: "yearly", priority: 0.5 },
    { url: `${baseUrl}/compliance`, lastModified: lastModified.legal, changeFrequency: "yearly", priority: 0.5 },
    { url: `${baseUrl}/personal`, lastModified: lastModified.personal, changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/app`, lastModified: lastModified.app, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/business`, lastModified: lastModified.business, changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/checkout`, lastModified: lastModified.checkout, changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/payment-links`, lastModified: lastModified.paymentLinks, changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/payroll`, lastModified: lastModified.payroll, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/stablecoin`, lastModified: lastModified.stablecoin, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/invoicing`, lastModified: lastModified.invoicing, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/cards`, lastModified: lastModified.cards, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/partners`, lastModified: lastModified.partners, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/developers`, lastModified: lastModified.developers, changeFrequency: "monthly", priority: 0.8 },
  ]
}

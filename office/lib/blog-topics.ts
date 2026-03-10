/**
 * Default blog topics - always available in the Office admin.
 * Admin can add more via /blog/topics.
 */
export const DEFAULT_BLOG_TOPICS = [
  { slug: "product-updates", name: "Product Updates", heading: "What we're launching" },
  { slug: "business-banking", name: "Business Banking", heading: "Business Banking" },
  { slug: "company-updates", name: "Company Updates", heading: "Company Updates" },
  { slug: "support", name: "Support", heading: "Support" },
  { slug: "global-finance", name: "Global Finance", heading: "Global Finance" },
] as const

/**
 * Fixture posts for development and for `BLOG_FIXTURES=1` builds (`npm run check:seo`). Sample titles, excerpts and
 * people come from the design-system cards (WebBlogCard, WebBlogPost). These are NOT real posts and are never read
 * unless fixtures are switched on: a production build with no database shows the empty states instead.
 *
 * Copy rule: no Easner fees, rates or country counts here. Timing lines are the generic ones the design card uses.
 */
import { plainText, type BlockNode, type DocNode, type InlineNode, type Mark, type TextNode } from "@easner/blog-content"
import type { BlogAuthor, BlogCategory, BlogPost, FocalPoint } from "../types"

const text = (value: string, marks?: Mark[]): TextNode => ({ type: "text", text: value, ...(marks ? { marks } : {}) })
const link = (value: string, href: string) => text(value, [{ type: "link", attrs: { href } }])
const p = (...parts: (string | InlineNode)[]) => ({
  type: "paragraph" as const,
  content: parts.map((part) => (typeof part === "string" ? text(part) : part)),
})
const h = (level: 2 | 3 | 4, value: string) => ({ type: "heading" as const, attrs: { level }, content: [text(value)] })
const ul = (...items: string[]) => ({
  type: "bulletList" as const,
  content: items.map((item) => ({ type: "listItem" as const, content: [p(item)] })),
})
const doc = (...content: BlockNode[]): DocNode => ({ type: "doc", content })

const cover = (name: string) => `/blog-fixtures/cover-${name}.svg`

export const FIXTURE_CATEGORIES: BlogCategory[] = [
  {
    id: "c-product-updates", slug: "product-updates", name: "Product updates", sortOrder: 10, ogArtPath: null,
    description: "Launches, new features and what changed in Easner.",
    intro: "Launches, new features and what changed in Easner, written by the people who built them.",
    seoTitle: null, seoDescription: null,
  },
  {
    id: "c-business", slug: "business", name: "Business", sortOrder: 20, ogArtPath: null,
    description: "Guides for companies: getting paid, paying suppliers and contractors, payroll and checkout.",
    intro: "Guides for companies: getting paid, paying suppliers and contractors, payroll and checkout.",
    seoTitle: null, seoDescription: null,
  },
  {
    id: "c-personal", slug: "personal", name: "Personal", sortOrder: 30, ogArtPath: null,
    description: "Guides for people: sending home, getting paid from abroad, holding USD and EUR, and cards.",
    intro: "Guides for people: sending home, getting paid from abroad, holding USD and EUR, and cards.",
    seoTitle: null, seoDescription: null,
  },
  {
    id: "c-global-money", slug: "global-money", name: "Global money", sortOrder: 40, ogArtPath: null,
    description: "How cross-border money actually moves: corridors, stablecoins where enabled, FX and the rails underneath.",
    intro: "How cross-border money actually moves: corridors, stablecoins where enabled, FX and the rails underneath. Explainers and our point of view.",
    seoTitle: null, seoDescription: null,
  },
  {
    id: "c-company", slug: "company", name: "Company", sortOrder: 50, ogArtPath: null,
    description: "News from Easner: the team, partnerships and milestones.",
    intro: "News from Easner: the team, partnerships and milestones.",
    seoTitle: null, seoDescription: null,
  },
]

const author = (slug: string, name: string, title: string, location: string | null, extra: Partial<BlogAuthor> = {}): BlogAuthor => ({
  id: `a-${slug}`, slug, name, title, location, avatarPath: null, bio: null,
  xUrl: null, linkedinUrl: null, githubUrl: null, websiteUrl: null, ...extra,
})

export const FIXTURE_AUTHORS: BlogAuthor[] = [
  author("ada-okafor", "Ada Okafor", "Head of Content, Easner", "Lagos, Nigeria", {
    bio: doc(
      p("Ada writes about getting paid across borders, from Lagos. Before Easner she ran finance for a design studio with clients in 12 countries. Read her guide to ", link("USD accounts", "/personal"), "."),
    ),
    xUrl: "https://x.com/easnerbanking",
    linkedinUrl: "https://www.linkedin.com/company/easner/",
    websiteUrl: "https://www.easner.com",
  }),
  author("daniel-mensah", "Daniel Mensah", "Product Lead, Payroll", "Accra, Ghana", {
    bio: doc(p("Daniel leads Payroll at Easner and writes about paying distributed teams.")),
    linkedinUrl: "https://www.linkedin.com/company/easner/",
  }),
  author("priya-raman", "Priya Raman", "Business Payments", null, {
    bio: doc(p("Priya writes about getting paid and paying suppliers for growing companies.")),
  }),
  author("sofia-hernandez", "Sofia Hernández", "Personal Banking", "Mexico City, Mexico", {
    bio: doc(p("Sofia writes about everyday money across borders.")),
  }),
  author("kwame-asante", "Kwame Asante", "Co-founder", null, {
    bio: doc(p("Kwame writes about why Easner exists.")),
  }),
]

interface FixtureInput {
  slug: string
  title: string
  excerpt: string
  summary?: string
  category: string
  authors: string[]
  cover: string
  focal?: FocalPoint
  publishedAt: string
  modifiedAt?: string
  minutes: number
  featured?: boolean
  featuredRank?: number
  seoTitle?: string
  body: DocNode
}

const cat = (slug: string) => FIXTURE_CATEGORIES.find((c) => c.slug === slug)!
const auth = (slug: string) => FIXTURE_AUTHORS.find((a) => a.slug === slug)!

function post(input: FixtureInput): BlogPost {
  const category = cat(input.category)
  const words = plainText(input.body).split(/\s+/).filter(Boolean).length
  return {
    id: `p-${input.slug}`,
    slug: input.slug,
    title: input.title,
    excerpt: input.excerpt,
    summary: input.summary ?? null,
    coverPath: input.cover,
    coverAlt: `Cover illustration for “${input.title}”`,
    coverFocal: input.focal ?? { x: 0.5, y: 0.5 },
    ogImagePath: null,
    categoryId: category.id,
    productPage: null,
    featured: Boolean(input.featured),
    featuredRank: input.featuredRank ?? null,
    seoTitle: input.seoTitle ?? null,
    seoDescription: null,
    canonicalUrl: null,
    noindex: false,
    focusKeyword: null,
    wordCount: words,
    readingMinutes: input.minutes,
    publishedAt: input.publishedAt,
    contentModifiedAt: input.modifiedAt ?? null,
    category: { id: category.id, slug: category.slug, name: category.name },
    authors: input.authors.map(auth),
    content: input.body,
    contentText: plainText(input.body),
    isDraft: false,
  }
}

const NIGERIA_SUMMARY =
  "You can get paid from the US in Nigeria with USD account details in your name. The sender pays like any US bank transfer, the money lands in your Easner USD balance in 1 to 2 business days, and you choose when to convert it to naira."

/** Every node and mark type in @easner/blog-content appears in this one document. */
const nigeriaBody = doc(
  { type: "summary", content: [p(NIGERIA_SUMMARY)] },
  p("Freelancers and small businesses in Lagos, Abuja and Port Harcourt are paid by US clients every day. The hard part is rarely the work. It is how the money arrives: what details to share, what the client sees, and what it costs by the time it reaches you. This guide covers the routes that work today."),
  h(2, "What to send your client"),
  p("Share the account name, routing number and account number from ", link("your USD account details", "/personal"), ". Your client adds you as a normal US recipient. No international wire form, no SWIFT code. You can also read the ", link("Easner help centre", "https://example.com/help"), " or a ", text("sponsored partner guide", [{ type: "link", attrs: { href: "https://example.org/guide", sponsored: true } }]), "."),
  ul("Account name: your name, exactly as verified", "Routing number and account number", "Bank address, if their bank asks for it"),
  { type: "orderedList", content: [{ type: "listItem", content: [p(text("Verify your identity", [{ type: "bold" }]), " in the app.")] }, { type: "listItem", content: [p(text("Copy", [{ type: "italic" }]), " the ", text("details", [{ type: "underline" }]), " you need, and ", text("never", [{ type: "strike" }]), " share your PIN.")] }] },
  { type: "taskList", content: [{ type: "taskItem", attrs: { checked: true }, content: [p("Account verified")] }, { type: "taskItem", attrs: { checked: false }, content: [p("First payment received")] }] },
  h(3, "If your client pays by card"),
  p("Send an invoice instead. The client can pay online by card, by bank transfer, or with stablecoin where enabled. Use ", text("account_details", [{ type: "code" }]), " as the reference."),
  h(4, "When a card payment settles"),
  p("Card payments usually settle in 2 business days and show in your balance as Processing until then.", { type: "hardBreak" }, "Check the status in the app."),
  { type: "callout", attrs: { variant: "info" }, content: [p("Your USD details are in your name once your account is verified. Payments sent before verification are returned to the sender.")] },
  { type: "callout", attrs: { variant: "warning" }, content: [p("Never share your Easner PIN or one-time codes. Easner will never ask for them.")] },
  { type: "callout", attrs: { variant: "success" }, content: [p("Once the first payment lands, your client can save your details for next time.")] },
  { type: "blockquote", attrs: { attribution: "Tolu Adeyemi, product designer, Lagos" }, content: [p("The day our first US client paid into an account in my own name, invoicing stopped being the hard part.")] },
  h(2, "How long it takes"),
  {
    type: "table",
    content: [
      { type: "tableRow", content: ["Route", "Time to your balance", "What your client does"].map((t) => ({ type: "tableHeader" as const, content: [p(t)] })) },
      ...[
        ["US bank transfer (ACH)", "1 to 2 business days", "Pays you like any US account"],
        ["Wire transfer", "Same day", "Sends a domestic wire"],
        ["Card payment on an invoice", "2 business days", "Pays your invoice by card"],
      ].map((row) => ({ type: "tableRow" as const, content: row.map((t) => ({ type: "tableCell" as const, content: [p(t)] })) })),
    ],
  },
  { type: "image", attrs: { src: cover("navy"), alt: "A phone screen showing USD account details", caption: "Your USD account details, as your client copies them.", width: "column", widthPx: 1600, heightPx: 900 } },
  { type: "image", attrs: { src: cover("ivory"), alt: "Two arcs joining a sender and a receiver", caption: "Wide image: breaks out of the column to 960px on desktop.", width: "wide", widthPx: 1600, heightPx: 900 } },
  { type: "codeBlock", attrs: { language: "bash" }, content: [text('# Create a payment link with the Easner API\ncurl https://api.easner.com/v1/payment_links \\\n  -H "Authorization: Bearer $EASNER_KEY" \\\n  -d amount=45000 -d currency=usd')] },
  { type: "embed", attrs: { provider: "youtube", url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", title: "Getting paid from the US, in 2 minutes" } },
  { type: "keyTakeaways", content: [ul("USD details in your name, once verified", "ACH arrives in 1 to 2 business days", "Convert to naira when you choose, at the rate shown before you confirm")] },
  h(2, "Steps to get started"),
  {
    type: "steps",
    attrs: { name: "How to get paid from the US" },
    content: [
      { type: "step", attrs: { name: "Open your USD account" }, content: [p("Verify your identity in the app. It usually takes a few minutes.")] },
      { type: "step", attrs: { name: "Copy your details" }, content: [p("Accounts → USD → Account details → Copy all.")] },
      { type: "step", attrs: { name: "Send them to your client" }, content: [p("Your client adds you as a US recipient and pays.")] },
    ],
  },
  { type: "definition", attrs: { term: "ACH" }, content: [p("The US network for bank-to-bank transfers. Cheap and reliable, usually 1 to 2 business days.")] },
  h(2, "Questions"),
  {
    type: "faq",
    content: [
      { type: "faqItem", attrs: { question: "Do I need a US address?" }, content: [p("No. Your USD account details are issued to you where you live, once your identity is verified.")] },
      { type: "faqItem", attrs: { question: "Can I receive from Europe too?" }, content: [p("Yes. Hold EUR alongside USD and share the matching details with the sender.")] },
    ],
  },
  { type: "horizontalRule" },
  { type: "cta", attrs: { variant: "open-account", heading: "Get paid from the US", body: "Open an account and share your USD details today." } },
  { type: "productCard", attrs: { product: "invoicing" } },
  { type: "button", attrs: { label: "See Personal Banking", href: "/personal" } },
  { type: "sources", content: [
    { type: "sourceItem", attrs: { title: "ACH participation", publisher: "Federal Reserve", url: "https://www.federalreserve.gov/paymentsystems/ach_about.htm" } },
    { type: "sourceItem", attrs: { title: "FX guidance for individuals", publisher: "Central Bank of Nigeria", url: "https://www.cbn.gov.ng" } },
  ] },
)

/** A short body for the rest of the fixtures: a summary, two paragraphs, one section. No figures. */
const short = (summary: string, ...paragraphs: string[]) =>
  doc(
    { type: "summary", content: [p(summary)] },
    ...paragraphs.map((paragraph) => p(paragraph)),
    h(2, "Where to go next"),
    p("Read the ", link("product page", "/personal"), " for the details that apply to your account."),
  )

export const FIXTURE_POSTS: BlogPost[] = [
  post({
    slug: "how-to-get-paid-from-the-us-when-you-live-in-nigeria",
    title: "How to get paid from the US when you live in Nigeria",
    excerpt: "USD account details in your name, what the sender sees, and how long each route takes to reach naira.",
    summary: NIGERIA_SUMMARY,
    category: "global-money", authors: ["ada-okafor"], cover: cover("ivory"), focal: { x: 0.5, y: 0.45 },
    publishedAt: "2026-11-12T09:00:00Z", modifiedAt: "2026-11-14T09:00:00Z", minutes: 7,
    featured: true, featuredRank: 1, body: nigeriaBody,
  }),
  post({
    slug: "payroll-now-pays-contractors-in-local-currency",
    title: "Payroll now pays contractors in local currency",
    excerpt: "Approvals, pay stubs and local-currency payouts for contractors, from the same Easner Business dashboard.",
    summary: "Payroll can now pay contractors in their local currency, with approvals and pay stubs in the same dashboard.",
    category: "product-updates", authors: ["daniel-mensah"], cover: cover("launch"), publishedAt: "2026-11-10T09:00:00Z", minutes: 4,
    featured: true, featuredRank: 2, seoTitle: "Easner Payroll now pays contractors in local currency",
    body: short("Payroll can now pay contractors in their local currency, with approvals and pay stubs in the same dashboard.", "Contractors are paid in the currency they live in, and every payout has a pay stub.", "Approvals work the way they do for employees: someone reviews the run, and the payout goes out."),
  }),
  post({
    slug: "checkout-or-payment-links-which-one-fits-your-business",
    title: "Checkout or Payment Links: which one fits your business",
    excerpt: "If you have a website, Checkout. If you don't, a link. Here is how to choose in two minutes.",
    category: "business", authors: ["priya-raman"], cover: cover("navy"), publishedAt: "2026-11-06T09:00:00Z", minutes: 5,
    featured: true, featuredRank: 3,
    body: short("If you have a website, use Checkout. If you don't, use a Payment Link.", "Both take the same payments. The difference is where the customer pays.", "Start with the one that matches how your customers find you."),
  }),
  post({
    slug: "holding-usd-and-eur-without-a-foreign-bank-account",
    title: "Holding USD and EUR without a foreign bank account",
    excerpt: "What account details in your name mean, what they don't, and when holding a second currency helps.",
    category: "personal", authors: ["sofia-hernandez"], cover: cover("deep"), publishedAt: "2026-11-03T09:00:00Z", minutes: 6,
    body: short("Account details in your name let you receive USD or EUR where you live.", "They are not a foreign bank account, and what they allow depends on where you live.", "Holding a second currency helps when you are paid in it, or when you spend in it."),
  }),
  post({
    slug: "what-stablecoin-settlement-changes-for-a-payment-to-kenya",
    title: "What stablecoin settlement changes for a payment to Kenya",
    excerpt: "Where it is enabled, why it can cut the time to KSh, and what the person receiving it actually sees.",
    category: "global-money", authors: ["ada-okafor"], cover: cover("tint"), publishedAt: "2026-10-29T09:00:00Z", minutes: 8,
    body: short("Stablecoin settlement moves the middle of a payment onto a faster rail, where it is enabled. The person receiving it sees local currency.", "The sender and the receiver never need a crypto wallet.", "What changes is the time between sending and receiving, not what the receiver has to do."),
  }),
  post({
    slug: "why-we-built-easner-for-corridors-legacy-rails-serve-worst",
    title: "Why we built Easner for corridors legacy rails serve worst",
    excerpt: "A note from the founders on Ghana, the Philippines and the businesses that move money between them.",
    category: "company", authors: ["kwame-asante"], cover: cover("company"), publishedAt: "2026-10-24T09:00:00Z", minutes: 3,
    body: short("Easner exists for the corridors where legacy rails are slowest and most expensive.", "This is a note on why we started, and who we build for.", "More soon."),
  }),
  post({
    slug: "paying-suppliers-in-mexico-a-checklist-for-finance-teams",
    title: "Paying suppliers in Mexico: a checklist for finance teams",
    excerpt: "CLABE details, cut-off times, and the three questions to ask before your first payout.",
    category: "business", authors: ["priya-raman"], cover: cover("ivory"), publishedAt: "2026-10-20T09:00:00Z", minutes: 6,
    body: short("Before your first payout to a Mexican supplier, confirm their CLABE, the cut-off time and who pays which fee.", "Ask the supplier for the CLABE and the name on the account.", "Check cut-off times before you schedule the payout."),
  }),
  post({
    slug: "sending-money-home-to-the-philippines-for-less",
    title: "Sending money home to the Philippines for less",
    excerpt: "Fees shown before you send, the rate you get, and how long it takes to reach a bank or wallet.",
    category: "personal", authors: ["sofia-hernandez"], cover: cover("tint"), publishedAt: "2026-10-15T09:00:00Z", minutes: 5,
    body: short("Compare the total the recipient gets, not only the fee: the rate matters as much.", "Easner shows the fee and the rate before you confirm.", "Check how long each route takes before you choose."),
  }),
  post({
    slug: "invoices-can-now-be-paid-online-by-card",
    title: "Invoices can now be paid online by card",
    excerpt: "A third way to pay on every hosted invoice, next to bank transfer and stablecoin where enabled.",
    category: "product-updates", authors: ["daniel-mensah"], cover: cover("navy"), publishedAt: "2026-10-09T09:00:00Z", minutes: 3,
    body: short("Hosted invoices can now be paid by card, next to bank transfer and stablecoin where enabled.", "Your customer picks the way they prefer to pay.", "You see the payment on the invoice."),
  }),
  post({
    slug: "paying-contractors-in-ghana-what-changes-with-local-currency-payroll",
    title: "Paying contractors in Ghana: what changes with local-currency payroll",
    excerpt: "How cedi payouts, pay stubs and approvals work when your team is in Accra and your account is in USD.",
    category: "business", authors: ["ada-okafor"], cover: cover("deep"), publishedAt: "2026-10-05T09:00:00Z", minutes: 4,
    body: short("Local-currency payroll pays your team in cedis while your account stays in USD.", "Each run has approvals and each payout has a pay stub.", "Plan around the cut-off times for the run."),
  }),
  post({
    slug: "what-a-corridor-is-and-why-it-matters",
    title: "What a corridor is, and why it matters",
    excerpt: "A corridor is one route between a sending country and a receiving country. Here is how to read one.",
    category: "global-money", authors: ["ada-okafor"], cover: cover("launch"), publishedAt: "2026-09-28T09:00:00Z", minutes: 5,
    body: short("A corridor is one route for money between two countries, with its own rails, cut-off times and rules.", "Two corridors with the same currency can behave very differently.", "That is why Easner talks about corridors, not just countries."),
  }),
  post({
    slug: "getting-paid-from-abroad-a-checklist",
    title: "Getting paid from abroad: a checklist",
    excerpt: "Five things to sort out before your first client payment arrives.",
    category: "personal", authors: ["sofia-hernandez"], cover: cover("ivory"), publishedAt: "2026-09-20T09:00:00Z", minutes: 4,
    body: short("Before your first client payment, verify your account, share the right details and check the currency.", "A short checklist saves a returned payment.", "Keep a copy of the details you shared."),
  }),
  post({
    slug: "reading-a-payment-receipt-from-start-to-finish",
    title: "Reading a payment receipt from start to finish",
    excerpt: "What each line on a payment receipt means, and where to look when something does not match.",
    category: "personal", authors: ["sofia-hernandez"], cover: cover("deep"), publishedAt: "2026-09-12T09:00:00Z", minutes: 3,
    body: short("A receipt shows what you sent, the rate and what arrives. Check those three lines first.", "Start with the amount sent and the amount received.", "Then check the rate and the fee line."),
  }),
  post({
    slug: "how-approvals-work-for-a-team-account",
    title: "How approvals work for a team account",
    excerpt: "Who can create a payment, who approves it, and what happens while it waits.",
    category: "business", authors: ["priya-raman"], cover: cover("tint"), publishedAt: "2026-09-05T09:00:00Z", minutes: 4,
    body: short("A payment can need one or more approvers before it goes out.", "Creators prepare the payment and approvers review it.", "Until it is approved, the payment waits."),
  }),
  post({
    slug: "a-note-on-how-we-write-this-blog",
    title: "A note on how we write this blog",
    excerpt: "Plain language, sources for money claims, and a second pair of eyes before anything goes live.",
    category: "company", authors: ["kwame-asante"], cover: cover("company"), publishedAt: "2026-08-30T09:00:00Z", minutes: 2,
    body: short("We write in plain language and cite sources for claims about money.", "Every post has a second reader.", "If something is wrong, tell us."),
  }),
]

/** An old slug that 301s to a current post, so the redirect path can be tested without a database. */
export const FIXTURE_REDIRECTS: { fromSlug: string; toSlug: string }[] = [
  { fromSlug: "nigeria-payments-guide", toSlug: "how-to-get-paid-from-the-us-when-you-live-in-nigeria" },
]

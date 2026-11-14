# Blog + Website Admin — plan

Status: decided, ready for Phase 0 (design) · 2026-11-14

## 1. What existed before (and why we're not just restoring it)

Yes, we had a blog. It lived in two places and was removed in two steps:

| Piece | Where it was | Removed in |
|---|---|---|
| Public blog: `/blog`, `/blog/[slug]`, `/blog/feed` (RSS), `/api/blog/posts`, search dialog, featured block, topic sections | `website/app/blog/*`, `website/components/blog/*`, `website/lib/blog-service.ts`, `website/lib/supabase.ts` | `577ac45` (2026-06-06) "Remove blog/Supabase integration…" |
| Admin: Office → Blog (list, new, edit, authors, topics) | `office/app/blog/*` in this repo, back when it was a full monorepo | `1dc6378` "Trim monorepo to web, website, and packages." |
| Topics constant | `packages/shared/src/constants/blog-topics.ts` (Product Updates, Business Banking, Company Updates, Support, Global Finance) | `577ac45` |
| Schema | Supabase tables `blog_posts`, `blog_authors`, `blog_topics` (+ `featured` flag migration) in the banking Supabase project | — (tables may still exist there) |

It was an MVP and not worth reviving as-is:

- **The editor was a plain `<textarea>`** for `body`, a URL text field for the cover image, `alert()` for errors. No rich text, no uploads, no autosave, no preview, no SEO fields.
- **The admin wrote straight to Supabase from the browser** with the anon client — security rested entirely on RLS in the *banking* database.
- **The public pages were client-rendered** (`"use client"` index, client fetch), styled with `text-gray-*` / `font-bold`, i.e. pre–design system.
- No scheduling, no revisions, no redirects on slug change, no structured data, no OG images.

What's worth keeping: the IA (featured block → topic sections → read more), RSS, the search dialog idea, authors + topics as their own tables.

## 2. Decisions

1. **Separate Supabase project for the website** (`easner-website`), not the banking database. A marketing CMS should never share auth, RLS or service keys with money movement. Nothing on the website needs banking data.
2. **New admin app in this repo: `admin/`** (workspace next to `website/`), deployed to `admin.easner.com` as its own Vercel project. ✅ Confirmed 2026-11-14.
   - Why not `/admin` inside `website`: keeps auth, editor bundle (~300 KB of ProseMirror) and a looser CSP off the public marketing site; separate cookies/domain.
   - Why not inside easnerbanking Office: Office is the banking staff console (owner keys, step-up, banking Supabase). Different blast radius, different people (marketing writers shouldn't need Office access).
   - It **looks and behaves like Office** — same `AppShell`, `PageHeader`, `Table`, `Sheet`, `FilterTabs`, `SearchField`, `StatusBadge`, `ConfirmDialog`, `Toast`, `EmptyState`, same tokens — per `design-system/guides/25-office.md`.
   - **Built on Office's UI and UX, not its code or data.** Phase 1 copies Office's UI layer from `easnerbanking/office`: `components/ui/*` (button, table, sheet, dialog, confirm-dialog, filter-tabs, search-field, page-header, status-badge, empty-state, select, tabs, tooltip, command, sonner…), the shell from `components/layout`, the skeleton pattern, and the same stack (Radix, `cmdk` for Jump to ⌘K, `sonner`, TanStack Query with the persisted cache, URL-state filters). The source commit is recorded in `admin/README.md` and kept in step through the design-system specs, which both apps follow.
   - **Same UX principles** from `25-office.md`: look up first (⌘K), records with list → quick-view `Sheet` → full page, every sensitive action explained and confirmed, cache first, state in the URL, calm and exact copy, tokens only.
   - **What differs from Office**: its own sign-in and roles (Owner/Editor/Writer; no owner security keys or scheduled-change approvals), no banking data, and new screens Office doesn't have: the editor, media library, Analytics.
3. **Content stored as structured JSON (Tiptap/ProseMirror doc), rendered server-side to React on the website** with our own node → component map. No stored HTML, no `dangerouslySetInnerHTML`, no MDX-in-DB. This is what lets one doc render as the article, the RSS item, the `llms.txt` entry and the OG card.
4. **Website blog pages are server components with ISR + on-demand revalidation** (`revalidateTag`) triggered by the admin on publish/unpublish/edit.
5. **Design first, in the design system**, then build — new cards in `easnerbanking/design-system/components/`, same as every other surface.

## 3. Public blog — UX

### Routes
| Route | Purpose |
|---|---|
| `/blog` | Index |
| `/blog/[slug]` | Post |
| `/blog/categories/[slug]` | Category archive (real URL, indexable — replaces old `?topic=`). One category per post. |
| `/blog/authors` | All authors (grid: photo, name, role, post count) |
| `/blog/authors/[slug]` | Author page (see below) |
| `/blog/feed.xml` (+ `/blog/categories/[slug]/feed.xml`, `/blog/authors/[slug]/feed.xml`) | RSS / Atom |

Everything lives under `/blog`. Post slugs share `/blog/[slug]` with these sections, so `categories`, `authors`, `feed.xml`, `page` and `search` are **reserved slugs** that the admin refuses.

### Categories, and why there are no tags
**One category per post, no tags.** Tags tend to sprawl ("stablecoin", "stablecoins", "USDC"), produce dozens of thin pages that hurt SEO, and add a field writers fill in carelessly. One category plus good internal links and related posts covers it. If we ever need cross-cutting groupings (e.g. a "Nigeria" series), that becomes a curated **Collection** an editor builds by hand, not free tagging. Not in scope now.

**Default categories** (seeded by the first migration, editable afterwards):

| Category | Slug | What goes in it |
|---|---|---|
| Product updates | `product-updates` | Launches, new features, changelog-style posts |
| Business | `business` | Guides for companies: getting paid, paying suppliers and contractors, payroll, checkout |
| Personal | `personal` | Guides for people: sending home, getting paid from abroad, holding USD/EUR, cards |
| Global money | `global-money` | Corridors, stablecoins, FX, how cross-border money actually moves (explainers, our POV) |
| Company | `company` | News, team, partnerships, milestones |

Changes from the old five: "Business Banking" → **Business** (wider than banking), "Global Finance" → **Global money** (plainer), "Support" dropped (that's Intercom help content, not the blog), **Personal** added to match the site's Personal/Business split.

**Rules in the admin to keep it clean:**
- Only Editors/Owners create, rename, reorder or archive categories; Writers pick from the list.
- A category needs a name, description and intro paragraph before it can be shown publicly (no empty-looking archive pages).
- A category with no published posts is hidden from the chips, sitemap and nav, and its URL 404s until it has one.
- Renaming a slug creates a 301. Deleting is only possible with zero posts; otherwise **Archive** (posts must be moved first, with a "Move N posts to…" step).
- Soft cap: the admin warns above 8 categories. The index chip row should fit on one line on desktop.

### Author page (`/blog/authors/[slug]`)
- Header: large photo, name, role/title ("Head of Product, Easner"), location (optional), bio (short rich text, links allowed), social icons (X, LinkedIn, GitHub, website). No email address shown (spam magnet; contact goes through /contact).
- Stats line: "12 posts · Writing about business banking, global finance" (their top categories).
- Their posts grid (same `WebBlogCard`, paginated), newest first.
- SEO: `ProfilePage` + `Person` JSON-LD with `sameAs` = their socials. This helps the "who wrote this" (E-E-A-T) signal for Google and AI answers.
- Posts link the byline and the end-of-post author card here.
| `/blog/[slug]/opengraph-image` | Generated OG card (title, category, author) unless a custom one is uploaded |
| Redirects | Old slugs → new slug (301) from a `blog_redirects` table, via `proxy.ts` |

Navigation: see §8 decision 4 (footer Company column + product-page "Related reading", not a top-level header link).

### Index (`/blog`)
- Page hero: `Eyebrow` "Blog" + `Headline` + short `MARKETING_BODY_TEXT` subhead, ⌘K / search button, RSS icon.
- **Featured**: 1 large + 2 stacked cards (editor-picked via `featured` / `featured_rank`).
- **Category chips** (sticky on scroll): All · Product updates · Business banking · Global finance · Company · Guides. Chips are links to `/blog/categories/*`, not client filters.
- **Latest grid**: 3-col → 2 → 1, `WebBlogCard` (cover 16:9, category, title, excerpt 2 lines, author avatar, date, read time). Pagination via "Load more" with real `?page=` URLs for crawlers.
- Newsletter strip "The Easner Dispatch — one email a month" (from Phase 4, see §8 decision 3), then the standard `CtaBand`.

### Post (`/blog/[slug]`)
Behaves like modern blogs (Stripe, Linear, Vercel, Ramp):
- Header: category link, H1 (Unbounded, capped size for long titles), dek/excerpt, author(s) with avatar, published + "Updated" date, read time.
- Cover image (or none — layout must look good without one).
- **Article column ~680px** with the new `web-prose` typography; wide images and tables can break out to ~960px.
- **Sticky table of contents** on ≥1280px (scroll-spy highlight); collapsible "On this page" on mobile.
- **Reading progress bar** under the header.
- Heading **anchor links** (hover `#`, copy link), **code blocks** with syntax highlighting + copy, **image lightbox**, captions, callouts, tables with horizontal scroll, embeds (YouTube, Loom, X) lazy-loaded with click-to-load facades (keeps CWV clean, no third-party cookies until click).
- Brand blocks: **CTA card** (download app / open business account, reusing `CtaPanel`), **FAQ block** (also emits `FAQPage` JSON-LD), **Key takeaways** box, **Product mention card** linking to a product page.
- Share row: copy link, X, LinkedIn, WhatsApp (important for our corridors), native share on mobile.
- Footer: author bio card, **related posts** (same category first, then recency; an editor can pin up to 3 by hand), CTA band.
- SEO and AEO: everything in §3a.
- **Draft preview**: Next `draftMode()` behind a signed token from the admin, banner "Preview — not published".
- Performance: static/ISR HTML, `next/image` from Supabase Storage (with image transforms), fonts already loaded, zero client JS except TOC/progress/lightbox/share islands.

### Search
⌘K dialog (same pattern as old `blog-search-dialog`, rebuilt on DS `Dialog`) backed by Postgres full-text search (`tsvector` on title, excerpt, plain-text body) through a cached route handler.

## 3a. SEO + AEO parity — the blog meets every rule the site already enforces

The site today runs on a few shared pieces. The blog reuses them rather than building its own. It goes under `app/(marketing)/blog/` so it inherits the marketing layout and its global JSON-LD.

### What the site does today → what the blog does

| Today (source) | Blog |
|---|---|
| **Metadata helper** `lib/marketing/metadata.ts` `marketingMetadata()`: title through the `"%s – Easner"` template (`app/layout.tsx`), `alternates.canonical`, OG + Twitter (`summary_large_image`, `@easnerbanking`), `en_US`, `metadataBase` www.easner.com | Every blog route calls `marketingMetadata()` from `generateMetadata`. OG type becomes `article` on posts (add an `article` option to the helper: `publishedTime`, `modifiedTime`, `authors`, `section` = category). Profile type on author pages. |
| **"Easner once in the title"** (`check-seo.py`) | If a post's title already contains "Easner" (e.g. "Easner launches Payroll"), the page uses `titleAbsolute` so it isn't "… – Easner" twice. The admin's SERP preview shows the final rendered title. |
| **Unique title + description** per page (`check-seo.py`) | The admin warns on a duplicate meta title/description across posts and existing pages. Description falls back to the excerpt; 70–155 char counter. Category, author and page-2+ archives get distinct generated titles/descriptions ("Business banking articles – page 2"). |
| **One H1** per page | The post title is the only H1. The editor offers H2–H4 only, and pasted H1s become H2. |
| **Canonical = URL** | Self-canonical on every blog URL. `?page=2` archives canonicalise to themselves (not to page 1). Query-string variants (`?utm`, `?ref`) canonicalise to the clean URL. Optional canonical override for syndicated posts. |
| **Global `Organization` + `WebSite` JSON-LD** (`(marketing)/layout.tsx`) | Inherited. Post schemas point `publisher` at `/#organization` and `isPartOf` at `/#website` by `@id`. |
| **`WebPage` answer-engine schema + `speakable` (`.aeo-answer`)** (`answerEngineJsonLd`) | Each post emits a `WebPage` node (same `@id` pattern as today, `…/blog/slug#webpage`, via `webPageJsonLd`) plus a `BlogPosting` whose `mainEntityOfPage` points at it. The post's **Summary** block renders with `.aeo-answer` and is the `speakable` selector. |
| **`FAQPage`, Q&A visible in HTML** (checked) | The FAQ block in the editor renders the visible Q&A **and** emits `FAQPage` from the same data, so they can't drift. |
| **`HowTo`, steps visible** | A "Steps" block (for guides) emits `HowTo` from the visible steps. |
| **`DefinedTerm` / glossary** | A "Definition" block emits `DefinedTerm`. Terms can link to `/answers`. |
| **`BreadcrumbList`** (last item = canonical) | Blog › Category › Post; Blog › Authors › Name. |
| **`FinancialService` / `areaServed`** on product pages | Not on posts. Posts link to the product page that owns that schema. |
| **Geo keyword ownership** (each page owns distinct country/region long-tails, no cannibalisation) | Each post has a **focus keyword** field. The admin warns when another post or a product page already owns that phrase (product ownership map lives in `positioning.ts` next to the keyword lists). Country/corridor posts link up to the page that owns the commercial term (e.g. a Nigeria remittance guide links to `/personal`). |
| **OG cards**: one designed card per page (`og-cards.ts` → `app/og/[slug]` → captured to `opengraph-image.jpg` by `generate-og-images.mjs`), served from www.easner.com, checked to exist | The post's **cover is the share image** (industry pattern), designed and uploaded by the design team; `OgCard` text layout is only the fallback. See "Share images" below. All URLs on www.easner.com, never a Supabase URL. |
| **`sitemap.ts`** with real `lastModified` dates (not `new Date()`) | Blog URLs are added from the DB: each post's `updated_at` (only when the content changed, not on a flag toggle), categories/authors with their newest post's date. Split into `sitemap.ts` + a blog sitemap via `generateSitemaps` if it grows. Add an image sitemap entry for cover images. |
| **`robots.ts`** allow all, sitemap link; `robots: index, follow` in layout | Unchanged for the blog. Add `max-image-preview:large` and `max-snippet:-1` (so Google Discover can use big cover images). Preview/draft responses send `noindex`. **admin.easner.com** sends `X-Robots-Tag: noindex` and a disallow-all `robots.txt`. |
| **`llms.txt`** generated from the same content as the pages | Add a `## Blog` section: newest ~50 posts as `- [Title](url): one-line summary`, grouped by category. Also serve **`/blog/[slug].md`**: a clean Markdown version of each post (linked with `<link rel="alternate" type="text/markdown">`), and an **`llms-full.txt`** that includes post bodies. |
| **`/answers` hub** (visible answers + `FAQPage` + `DefinedTermSet`) | Posts with FAQ/Definition blocks can be pinned into the matching `/answers` section ("Read more: …"). Answers link to the deeper post, so the post isn't a duplicate. |
| **Internal links must resolve** (`check-seo.py`) | The editor's link picker only offers real routes and posts. The pre-publish check fails on broken internal links. Renamed slugs are 301'd. |
| **`check:seo`** script over the production build | Extended (details below). |

### Share images (OG / X / LinkedIn / WhatsApp)

**What the industry does** (checked 2026-11-14, post-level `og:image` from Stripe, Ramp, Mercury, Brex, Wise, Airwallex, Linear, Vercel, Notion):
- **The share image *is* the post's cover art, full-bleed, edge to edge.** Same asset as the hero on the post and the card on the index, cropped to ~1.91:1 (1200×630 or 2400×1260). Nobody frames the cover inside a branded template or adds a logo bar around it.
- **Brand comes from art direction, not a frame**: Stripe = saturated gradients/product UI on brand colour; Ramp = big type on brand lime "Introducing … by ramp"; Vercel = black, white type, data viz; Wise = photography + brand green shapes; Airwallex = dark 3D shapes; Mercury = soft editorial illustration.
- **Text on the image only when it's designed in** — launches ("Introducing Token Spend Management", "Introducing Workflow SDK 5", "What's new · November 2026"). Guides and essays usually have no text on the image; the platform prints the title beside it.
- **Template-generated cards are only a fallback** for pages without art (Linear `/api/og/generic?title=…`, Stripe's default blog social card, Vercel's default blog OG).

**Decision for Easner** (confirmed 2026-11-14, replaces the framed/centred-cover idea):
1. **The design team designs the cover art and uploads it. The uploaded cover *is* the SEO/share image, full-bleed.** No frame, overlay or logo bar is added. A cover is required to publish.
2. **One upload, every use.** Upload at 2400×1350 (16:9) or larger. The admin crops from one focal point and previews each: share image 1200×630 (`og:image`, `twitter:image`), index card 16:9, post header, and the clean `BlogPosting.image` crops (16:9, 4:3, 1:1).
3. **Optional social override** (1200×630) for the rare case where the share image should differ from the cover (e.g. a campaign).
4. **Fallback only**: the existing `OgCard` text layout with the post title, for posts that somehow have no cover (migrated old posts), so a share never shows a blank.
5. **Cover guide in the design system** for designers: text only on launch covers (max 2 lines, "Introducing …"), none on guides/essays since platforms print the title beside the image; keep the subject in the centre 80% safe area (X and LinkedIn crop edges, WhatsApp shows a small square); flat brand colour, Easner blue/ivory/navy, product screens from the design system; no stock clichés (handshakes, piles of cash, crypto coins). Include a Figma/DS template frame at 2400×1350 with the safe areas marked.
6. **Cover kit (in-admin cover templates) moved to Later.** Not needed while design produces covers; revisit if writers publish without design support.

**Serving**: the share image is served from www.easner.com via `/blog/[slug]/opengraph-image` (proxy/redirect to the stored crop), with the content hash in the URL so platforms re-fetch after a cover change. Category, author and index pages get their own uploaded art (category art per category; author photo on brand colour as a fallback).

**Admin preview**: the Social preview tab shows the real image inside X, LinkedIn, WhatsApp, Slack and iMessage previews, with the safe-area overlay.

### New things only a blog needs
- **`BlogPosting` schema** per post: `headline`, `description`, `image` (cover, 1200×675 and 1:1), `datePublished`, `dateModified`, `author` (array of `Person` by `@id` → author page), `publisher` (`/#organization`), `articleSection` (category), `keywords` (focus keyword), `wordCount`, `timeRequired`, `inLanguage` `en-US`, `mainEntityOfPage`, `citation` for sources.
- **Author E-E-A-T**: author pages emit `ProfilePage` + `Person` (`jobTitle`, `image`, `sameAs` socials, `worksFor` → `/#organization`). Bylines and visible "Updated <date>" match the schema dates.
- **Answer-first writing** built into the editor: an optional **Summary** block at the top (2–3 sentences, plain language, the direct answer). It's rendered visibly, marked `.aeo-answer`, used as the `speakable` text, the `llms.txt` line, and the meta description fallback. Plus "Key takeaways", FAQ, Steps, Definition and a **Sources** block (outbound citations, `rel="noopener"`; regulated/financial claims should cite).
- **Archives**: category and author pages have a real intro paragraph (from the admin), `CollectionPage` + `ItemList` schema, crawlable `?page=N` links (not only "load more" JS), and stay `noindex` while thin.
- **Freshness signals**: "Updated" only changes on a real content edit (an editor toggle, "This is a significant update", controls `dateModified`).
- **Instant indexing**: on publish/update the admin calls revalidate, then pings **IndexNow** (Bing — which also feeds ChatGPT/Copilot search) with the URL. Google picks up the sitemap `lastmod`; Search Console verification stays as it is today.
- **RSS** feeds with full content and `<link rel="alternate" type="application/rss+xml">` in the head.
- **Images**: required alt, explicit width/height (no layout shift), AVIF/WebP, descriptive filenames from the slug, `ImageObject` in schema.
- **Core Web Vitals**: posts are static HTML; embeds use click-to-load facades; no client JS beyond TOC/progress/lightbox/share. Target LCP < 2.0s on mobile.
- **Link hygiene**: external links get `rel="noopener"`; sponsored/affiliate links get `rel="sponsored"`; comment-free blog, so no UGC handling.
- **Compliance in copy**: the brand-voice lint also checks the required qualifiers in `VOICE-AND-GUARDRAILS.md` (e.g. how we describe accounts, cards, stablecoins). That's an SEO issue too: AI engines quote us verbatim.

### `check:seo` extended to the blog
`scripts/check-seo.py` discovers routes from `app/(marketing)/**/page.tsx`. It must learn dynamic routes (read prerendered `blog/*.html` from the build, or the sitemap) and its "sitemap == public pages" rule must include them. Blog checks:
- All the existing per-page rules (one title with Easner once, unique title/description, one H1, canonical, index allowed, OG/Twitter match, OG image exists on www.easner.com, Organization + WebSite, internal links resolve, breadcrumb last item = canonical).
- Posts: `BlogPosting` present with `datePublished`, `dateModified`, `author` → an existing author page, `publisher` `@id`; FAQ/HowTo/DefinedTerm text visible in HTML; speakable selector present when a Summary exists; every `<img>` has alt and dimensions.
- Archives: `CollectionPage`; thin archives are `noindex` **and** absent from the sitemap.
- `llms.txt` lists every indexable post; every `/blog/[slug].md` exists.
- Run in CI on the website build, and the admin runs the per-post subset live as the pre-publish checklist.

## 4. Admin — UX (Office look)

Desktop-first like Office (`DesktopMinViewportGate` below 1024px), but the editor should still be usable on a 13" laptop.

### Shell / nav
Easner logo · **Overview** · **Analytics** (Website · Blog) · **Posts** · **Media** · **Categories** · **Authors** · **Redirects** · **Settings** (team, roles). Header: Jump to (⌘K: posts, categories, authors), "New post" button, account menu.

### Overview — the admin's home (`OffBlogOverview`, built like `OffDashboard`)
The page the content team lands on after sign-in: what needs doing, and what's working. Same patterns as Office's Dashboard: `PageHeader` "Overview", period pills (**7 days · 30 days · 90 days · 12 months**, in the URL), cache-first, skeletons only on a cold load, tokens only.

1. **Needs you** (top, only when non-empty): posts waiting for your review (Editors), changes requested on your drafts (Writers), claims-check second approvals, scheduled posts going live in the next 48 hours, published posts with SEO issues (missing summary, duplicate description, broken link). Each row opens the post.
2. **KPI row (4 tiles)**: Views · Readers (unique) · Avg. read depth · Sign-ups from the blog. Each with the change vs the previous period. In Phase 4, a 5th tile: Dispatch subscribers.
3. **Views over time**: one line/area chart for the period, with publish dates marked as dots so you can see what a post did.
4. **Top posts** (`Table`, 10 rows): post, category, views, read depth, CTA clicks, sign-ups. Row opens the post's quick view. "View all" opens Posts → Performance.
5. **Where readers come from** (two cards side by side):
   - **Sources**: Google · AI answers (ChatGPT, Perplexity, Gemini, Copilot, Claude referrals grouped, since AEO is a goal) · Social (X, LinkedIn, WhatsApp) · Direct · Email (Dispatch) · Other.
   - **Search**: top Google queries for `/blog` with impressions, clicks, CTR and average position (Google Search Console API).
6. **Categories**: views and posts per category for the period, so the team sees which themes pull readers.
7. **Pipeline** strip: Drafts · In review · Scheduled · Published this period, each linking to the filtered Posts list.

**Per post** (quick view + editor's **Performance** tab): the same numbers for that post, views over time since publish, sources, top Google queries for that URL, CTA clicks by block, and a read-depth curve (25/50/75/100%).

**Data**:
- The website already sends `$pageview` (manual, App Router), `$pageleave`, `cta_clicked`, a traffic-source property (`registerTrafficSource`) and, left over from the old blog, `blog_post_viewed` (`lib/marketing/analytics.ts`). Add `blog_read_depth` (25/50/75/100) and tag CTA blocks with `post_slug`; sign-ups attribute via the existing outbound attribution to the business/app sign-up links.
- The admin reads PostHog's query API and the Search Console API **server-side**, and a nightly job writes `blog_stats_daily` (post_id, date, views, readers, depth buckets, cta_clicks, signups, source counts) and `blog_search_daily` (post_id, date, query, impressions, clicks, position) into the website Supabase project. The Overview reads those tables, so it's instant and cache-first; "today" is topped up live from PostHog.
- AI-answer referrals are classified by referrer domain (chatgpt.com, perplexity.ai, gemini.google.com, copilot.microsoft.com, claude.ai).
- Visible to every admin role. Sign-up numbers are counts only; no personal data about readers is shown.

Phasing: **Needs you** and **Pipeline** ship in Phase 2 (they only need the posts table). Traffic, sources, search and per-post performance ship in Phase 4.

### Analytics — the whole website, not just the blog (`OffSiteAnalytics`)
One **Analytics** section with two tabs that share the same controls: period pills (Today · 7 days · 30 days · 90 days · 12 months · custom range), compare-to-previous toggle, and filters (country, device, source, page/category) written to the URL so a filtered view can be shared.

**Website tab** (every page on easner.com: home, product pages, pricing, legal, blog):
- **Live**: visitors on the site right now, and the pages they're on.
- **KPI tiles**: Visitors · Page views · Views per visit · Avg. time on page · Bounce rate · Conversions (clicks to open an account / download the app / book a call, from the existing `cta_clicked` and outbound attribution).
- **Traffic over time** chart (visitors and page views), with publish/launch annotations.
- **Pages** table: path, views, visitors, avg. time, bounce, exits, conversions. Row opens a page drill-down with the same breakdowns for that page.
- **Entry pages** and **exit pages**.
- **Sources**: channels (Google, AI answers, social, direct, email, referral, paid), referring domains, and UTM campaigns (`utm_source/medium/campaign`, already captured by `registerTrafficSource`).
- **Location**: world map + table by **country**, then **region and city** (PostHog GeoIP). Cities with fewer than 5 visitors in the period are grouped as "Other" so no one can be singled out.
- **Technology**: device type, browser, OS, screen size; language.
- **New vs returning** visitors.
- **Conversion funnel**: landing → product page → CTA click → sign-up started (attributed), by source and country — the corridor story (e.g. Nigeria, Kenya, Mexico, Philippines, India) is exactly what this shows.
- **Site health**: Core Web Vitals (LCP, INP, CLS) per page from PostHog web vitals, so a slow page shows up next to its traffic.

**Blog tab**: the same breakdowns filtered to `/blog`, plus everything blog-specific: read depth, top posts, categories, authors, Google queries (Search Console), AI-answer referrals, shares and "helpful" votes (below). Every post's **Performance** tab is this view scoped to one post: views, readers, country/city, sources, devices, read-depth curve, CTA clicks, shares by network, helpful votes, top queries.

**Overview** (admin home) keeps the editorial work queue and shows a compact summary of both tabs (site visitors, blog views, top 5 pages, top 5 posts) linking into Analytics.

**Shares — what we can and can't count, honestly**
- **Share clicks**: our share row (copy link, X, LinkedIn, WhatsApp, native share) sends `post_shared` with the network. Shown per post and per network.
- **Visits from shares**: every share button adds `?utm_source=<network>&utm_medium=share` to the link, so we see how many visits each share actually brought back (stripped from the canonical, so SEO is unaffected).
- **Social referrals**: visits from x.com/t.co, linkedin.com, WhatsApp, Facebook, Reddit, Slack even when someone shares the URL by hand.
- Not possible: public share counts on X or LinkedIn. Neither platform exposes per-URL share counts any more, so "shared 240 times on LinkedIn" can't be shown honestly. Our numbers are share clicks + the visits they produced, which is the more useful figure anyway.

**Likes → "Was this helpful?" instead**
Public like counters don't fit a calm fintech brand (none of Stripe, Ramp, Mercury, Wise, Linear or Vercel show them), and low counts on new posts look worse than no count. Instead, at the end of every post: **"Was this helpful?"** Yes / No, with an optional one-tap reason on No ("Out of date", "Not what I was looking for", "Too technical", "Missing my country"). No login, one vote per browser per post (rate-limited, IP hashed and discarded daily). Results are **admin-only**: helpful %, votes and reasons per post, and a "Needs a refresh" list on the Overview when a post's helpful score drops. That tells the content team what to fix; a like count wouldn't.

**Data plumbing**
- Source of truth is PostHog (already on every page): `$pageview` (manual, App Router), `$pageleave` (time on page), `cta_clicked`, traffic source/UTMs, GeoIP country/region/city, device/browser/OS, web vitals. New events: `blog_read_depth`, `post_shared`. Helpful votes are stored in Supabase (`blog_feedback`), not PostHog, because they're product data the team acts on.
- The admin queries PostHog server-side with HogQL. A nightly job rolls up into the website Supabase project so every chart opens instantly: `site_stats_daily` (date, path, visitors, views, avg_time, bounces, exits, conversions), `site_breakdown_daily` (date, path, dimension `country|region|city|device|browser|os|source|referrer|utm_campaign`, value, visitors, views), plus the blog tables. "Today" and Live come straight from PostHog.
- Search Console API for queries/impressions/position, all pages (not only blog).
- Retention: rollups kept for 25 months (year-over-year comparisons); raw events stay in PostHog under its own retention.

**Prerequisite — consent/privacy (site-wide, today)**: the website runs PostHog with cookies + localStorage and has no consent banner. For EU/UK visitors that needs fixing before we lean on these numbers: either a consent banner (decline = PostHog in cookieless/memory mode, still counting anonymous page views) or PostHog's cookieless mode for everyone. Recommendation: **cookieless by default for EU/UK, full tracking elsewhere**, with the privacy page updated. This is a separate small task, done before Phase 4.

### Posts list (`OffBlog` pattern = Office list page)
Toolbar: `SearchField` "Search posts" · `FilterTabs` All / Drafts / Scheduled / Published / Archived · Category `Select` · Author `Select`. Count caption. `Table`: cover thumb, title + slug, `StatusBadge` (Draft, Scheduled, Published, Changes not published, Archived), category, author, updated, published. Row opens a quick-view `Sheet` (stats, links, actions: Edit, View live, Copy preview link, Duplicate, Unpublish, Archive). Filters in the URL. `EmptyState` with "Write your first post".

### Editor (the main event)
Layout: full-width canvas, slim top bar, right **settings panel** (toggle `⌘.`).

**Top bar**: back · status + "Saved 4s ago" / "Saving…" / "Offline — changes kept locally" · Preview (opens website draft view in a new tab) · History · **Publish ▾** (Publish now / Schedule… / Update / Unpublish).

**Writing** (Tiptap, Notion/Ghost-grade):
- Title and dek as part of the canvas, not form fields.
- **Slash menu** (`/`) for every block: headings H2–H4, lists, checklist, quote, callout (info/warning/success), divider, image, gallery, table, code, embed, CTA card, FAQ, key takeaways, product card, button.
- **Bubble menu** on selection: bold, italic, underline, strike, code, link (with internal-link search across our pages and posts), H2/H3, quote.
- Markdown shortcuts (`##`, `-`, `1.`, `>`, ```` ``` ````, `**`), smart quotes/dashes, block **drag handles** + `⌥↑/↓` to move blocks.
- **Paste** from Google Docs / Notion / Word cleaned to our schema; pasting a URL on its own line turns into an embed; pasting/dropping an image uploads it.
- Images: upload to Supabase Storage, auto-resize/convert (WebP/AVIF via transforms), **alt text required** before publish, caption, width (column / wide / full).
- Word count, read time, outline (headings) in the side panel.
- Undo/redo, find & replace, focus mode.

**Settings panel** (tabs): **Post** (slug with lock after first publish, category, authors (multi), featured, cover image, excerpt) · **SEO** (focus keyword with "already owned by …" warning, meta title/description with live char counters, duplicate warning and a Google SERP preview showing the final rendered title, OG image upload or "auto", canonical override, noindex, "significant update" toggle for `dateModified`) · **AEO** (Summary present?, FAQ/Steps/Definition blocks found and which schema each will emit, sources count, pin to an `/answers` section, preview of the `llms.txt` line and the `.md` version) · **Social preview** (X/LinkedIn card preview using the real generated OG card).

**Saving & safety**
- **Autosave** every ~2s of idle to the draft; local IndexedDB backup if offline.
- **Drafts vs live**: editing a published post edits a draft copy; the live post only changes on **Update**. Status shows "Changes not published".
- **Revisions**: every publish + periodic autosave checkpoints; History panel with diff view and **Restore**.
- **Edit lock / presence**: "Ada is editing this post" via Supabase Realtime presence; take-over with confirm. (Full real-time co-editing with Yjs is a later phase.)
- **Scheduling**: pick date/time (shown with time zone); a Supabase cron / Vercel cron flips it live and calls revalidate.
- **Pre-publish checklist** (dialog, blocks or warns): the per-post `check:seo` rules from §3a (title/description unique and in range, brand once in title, one H1, cover + alt, every image alt, category, author with a complete profile, no broken internal links, at least one link to a product page, schema blocks valid), plus a **brand-voice lint** against the banned words / required qualifiers in `easnerbanking/docs/marketing/VOICE-AND-GUARDRAILS.md` (warn, highlight in text).
- Slug change on a published post auto-creates a 301 in `blog_redirects`.

### Media library (`OffBlogMedia`)
Grid of uploads, search, filter by used/unused, alt text + caption editable at the library level, shows "Used in N posts", safe delete (blocked if in use).

### Categories / Authors / Redirects
Office list + `Sheet` editors.
- **Categories**: name, slug, description, intro, order, SEO fields. Rules in §3 "Categories, and why there are no tags".
- **Authors**: photo (upload + crop to square), name, slug, role/title, location, bio, socials (X, LinkedIn, GitHub, website), linked admin member (optional). Guest authors are allowed: an author with no login.
- **My profile**: every signed-in writer can edit their own author profile (photo, bio, socials) from the account menu, without needing Editor rights. Slug changes are Editor-only.

### Auth & roles
- Supabase Auth on the website project: **email OTP** (no passwords) + **passkey/TOTP MFA required** (aal2), like Office.
- `admin_members` allowlist; anyone else who signs in sees "No access".
- Roles: **Owner** (team, settings, delete), **Editor** (publish anything, manage categories/authors/media/redirects), **Writer** (create/edit own drafts, submit for review; can't publish).
- **Review** (decided, §8 decision 2): Writer → "Submit for review" → Editor approves and publishes, with inline comments on the draft. Editors can publish their own posts, except posts the claims check flags, which need a second Editor.
- Activity log (who published/unpublished/changed slug, when) shown on the post's History.

## 5. Data model (new Supabase project)

```
admin_members      (user_id pk → auth.users, role owner|editor|writer, name, created_at)
blog_authors       (id, slug unique, name, title, location, avatar_path, bio jsonb,
                    x_url, linkedin_url, github_url, website_url, member_id null unique)
blog_categories    (id, slug unique, name, description, intro jsonb, og_art_path, sort_order, seo_title, seo_description)
blog_posts         (id, slug unique, status draft|in_review|scheduled|published|archived,
                    title, excerpt, cover_path, cover_alt, cover_focal_point,
                                                            og_image_path,                         -- optional social override
                    content jsonb            -- published doc
                    draft_content jsonb      -- working doc (null when no pending changes)
                    content_text text        -- plain text for search/read time/llms.txt
                    search tsvector generated,
                    category_id, product_page text null, featured bool, featured_rank int,
                    seo_title, seo_description, canonical_url, noindex bool,
                    focus_keyword, summary text,           -- Summary block text (AEO / speakable / llms.txt)
                    content_modified_at,                   -- drives dateModified + sitemap lastmod
                    answers_section null,                  -- pinned /answers section
                    word_count int, reading_minutes int, published_at, scheduled_for, updated_at, created_by, updated_by,
                    locked_by, locked_at)
blog_post_authors  (post_id, author_id, position)
blog_revisions     (id, post_id, content jsonb, title, excerpt, kind autosave|publish|restore, created_by, created_at)
blog_redirects     (from_slug pk, to_post_id, created_at)
blog_stats_daily   (post_id, date, views, readers, depth_25, depth_50, depth_75, depth_100, cta_clicks, signups, sources jsonb)
blog_search_daily  (post_id, date, query, impressions, clicks, position)
blog_feedback      (id, post_id, helpful bool, reason text null, visitor_hash, created_at)
site_stats_daily   (date, path, visitors, views, avg_time_s, bounces, exits, conversions)
site_breakdown_daily (date, path, dimension, value, visitors, views)
blog_media         (id, path, width, height, mime, size, alt, caption, created_by, created_at)
admin_activity     (id, actor, action, entity, entity_id, meta jsonb, created_at)
```

- **RLS**: anon can `select` only `status='published' and published_at <= now()` rows (and only published columns via a `blog_posts_public` view — never `draft_content`). All writes require an `admin_members` row; publish/delete require editor/owner (enforced in RLS + Postgres functions `publish_post`, `unpublish_post`, `restore_revision`).
- **Storage**: bucket `blog` (public read, member write), paths `posts/{post_id}/…`, `authors/…`.
- Website reads with the anon key server-side only (cached fetches tagged `blog`, `blog:post:{slug}`); admin calls a website route `POST /api/revalidate` with a shared secret after publish.
- Migrations live in this repo: `supabase/` at the root, applied with the Supabase CLI.

## 6. Design system work (easnerbanking/design-system)

New cards, each with `README.md` + `preview.html`, registered in `cards.json`, following the existing web layer (`web-*` tokens, Headline, Eyebrow, WebCard, CtaPanel):

**Website**
- `WebBlogIndex` — hero, featured trio, category chips, grid, load more, empty state.
- `WebBlogCard` — sizes: feature / standard / compact (related, search results).
- `WebBlogPost` — header, cover, article column, TOC, progress, share, author card, related, CTA.
- `WebProse` — the article typography system: body size/line-height per breakpoint, H2–H4, lists, quote, callout, code, table, figure/caption, embed facade, CTA/FAQ/takeaways blocks. New tokens: `web-prose-*` (measure, rhythm, heading scale).
- `WebBlogAuthor` — authors index + author page + byline + end-of-post author card.
- `WebBlogArchive` — category archive header + grid.
- `WebBlogSearch` — ⌘K dialog.
- `BlogCover` — cover brand guide, safe areas, crop set (share / card / header / schema), 2400×1350 template frame for designers; fallback share card = existing `OgCard` text layout.

**Admin (Office family)**
- `OffBlog` — posts list + quick view.
- `OffBlogEditor` — editor canvas, top bar states (saving/saved/offline/locked), slash menu, bubble menu, block handle, settings panel tabs, SEO/social previews, publish/schedule dialogs, pre-publish checklist, history + diff.
- `OffBlogOverview` — Needs you, KPI tiles, views chart, top posts, sources, search, categories, pipeline; per-post Performance tab.
- `OffSiteAnalytics` — Website and Blog tabs: live, KPI tiles, traffic chart, pages, entry/exit, sources/UTMs, location map (country → city), technology, new vs returning, funnel, web vitals; page drill-down.
- `WebPostFeedback` — "Was this helpful?" block and reason chips; share row with network tracking.
- `OffBlogMedia`, `OffBlogTaxonomy` (categories, authors + My profile, redirects).
- `OffAuth` variant for the admin (OTP + MFA, "No access").
- Add a short `guides/26-website-admin.md` (what differs from Office: roles, no owner keys, editor rules).

## 7. Build phases

| Phase | Scope | Output |
|---|---|---|
| **0. Design** | DS cards in §6, reviewed in `viewer.html` | Approved designs |
| **1. Foundation** | New Supabase project, migrations, RLS, storage; `admin/` app scaffold (Next 16, React 19, Tailwind 4, tokens via `sync:tokens`), auth + roles, Office shell | Sign in, empty Posts list |
| **2. Editor MVP** | Tiptap editor with core blocks, image upload, autosave, settings panel (post + SEO), drafts/publish/unpublish, Writer → Editor review (submit, comments, approve), preview link, revalidate hook, Overview (Needs you + Pipeline) | Write, review and publish a post |
| **3. Public blog** | `/blog`, post, category, authors index + author page, RSS, nav/footer link, draft mode, **and all of §3a**: metadata helper `article` mode, every schema, OG cards in the house design, sitemap, `llms.txt` / `.md` / `llms-full.txt`, IndexNow, `check:seo` extended + in CI | Live blog that passes `check:seo` |
| **4. Pro features** | Scheduling, revisions + diff/restore, edit lock/presence, redirects, media library, pre-publish checklist + brand lint, search ⌘K, related posts, claims-check second approval, product-page Related reading, newsletter (Dispatch via Resend), Analytics (Website + Blog tabs, PostHog + Search Console, nightly rollups), per-post Performance tab, "Was this helpful?", share tracking | Feature-complete |
| **5. Polish** | Perf (CWV), a11y (keyboard, focus, alt), overflow sweep at 375/1024/1280/1440/1920, Search Console + Rich Results Test on sample posts, check AI answer engines pick up `llms.txt` | Ship |
| Later | Header nav link (if the blog becomes a main channel), Collections, Cover kit (in-admin cover templates), real-time co-editing (Yjs), i18n posts | — |

## 8. Remaining questions — decided

What makes the Easner blog the best is the same thing that makes the product good: calm, exact, trustworthy, and clearly about moving money across borders. Every call below follows from that.

1. **Old content → start fresh, don't migrate.** The old posts lived in the banking Supabase project, written in a plain textarea, with no covers, SEO fields or structure; nothing in the banking repo still references those tables. Converting them would bring weak, pre-positioning copy into a new, high-quality blog. Instead: check Search Console for any old `/blog/<slug>` URLs that still get impressions and 301 them to the closest new post or `/blog`. If a specific old post is worth keeping, an editor rewrites it as a new post.

2. **Who writes → the internal team, with review built in.** Roles: Owner, Editor, Writer. **Writers always submit for review**; an Editor approves and publishes (inline comments on the draft, "Changes requested" status, notified by email). Editors may publish their own posts **except** when the claims check flags the draft (fees, rates, FX margins, yields, "insured"/FDIC, regulatory or licensing statements, competitor comparisons) — then a second Editor must approve. That's the regulated-fintech norm (one person writes, another signs off on money claims) without slowing down company news. Guest pieces (partners, customers) are entered by an Editor under a **guest author** profile with no login. **No comments** on posts: they need moderation, add spam/compliance risk and don't help the reader.

3. **Newsletter → yes, but not at launch; Phase 4.** A blog compounds through email, but capturing addresses with nothing to send is worse than no form. Launch with RSS plus "Follow on X / LinkedIn". In Phase 4, once there's a steady cadence (8+ posts), add **"The Easner Dispatch"**: one email a month with new posts, double opt-in, one-click unsubscribe. Subscribers are stored in the website Supabase project; sending through **Resend** (React Email templates, fits the Next stack) on a **separate marketing subdomain** (e.g. `news.easner.com`) — never the banking SendGrid sender, so marketing email can never hurt delivery of security and payment emails.

4. **Navigation → footer + contextual links, not a top-level header link.** The header is for products and conversion (Personal, Business, Build, Pricing, Contact); Stripe, Ramp and Mercury keep their blogs out of the primary nav too. So:
   - Footer **Company** column: About · **Blog** · Pricing · Answers · Contact · Legal.
   - **Related reading** row on product pages: posts link to one product page (a `product_page` field on the post); the product page shows the latest 3 linked posts once at least 2 exist. That's where readers and Google actually benefit, and it passes authority from posts to the pages that convert.
   - `/answers` links to the deeper posts (§3a).
   - Revisit a header link if the blog becomes a primary acquisition channel.

5. **Categories → the five defaults are final:** Product updates, Business, Personal, Global money, Company.

6. **Analytics → the whole website, not just the blog** (§4 "Analytics"): Website and Blog tabs with page views, visitors, sources, country/region/city, devices, funnel and web vitals; shares tracked as clicks + visits they bring back; **no public likes**, an admin-only "Was this helpful?" instead. Consent fix for EU/UK first. An Overview dashboard is the admin's home (§4 "Overview"): what needs you, KPIs, views over time, top posts, sources incl. AI answers, Google queries, categories, pipeline; plus a Performance tab on every post. Work queue in Phase 2, analytics in Phase 4.

7. **Infrastructure → confirmed as recommended:** separate `easner-website` Supabase project; Tiptap JSON rendered server-side; ISR + on-demand revalidation; design system first.

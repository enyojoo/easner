# Easner website improvement plan

Prepared September 5, 2026. Scope: improve the existing website using its current sections, components, visual identity, and product pages. Personal and business audiences receive equal attention.

## Current direction after user review

Latest approved homepage hero: “Your Money. Moved with Ease.” Supporting copy: “Bank, spend, and send with Easner Personal Banking. Bring your business accounts, customer payments, cards, and payouts together with Easner Business Banking.” Keep the original homepage product-card grid, section heading, order, and individual links. Do not group or redesign those cards. Every individual product page and URL remains available. The secondary hero CTA remains “Explore products” with the existing #products anchor.

This direction supersedes the initial headline and hero-mockup proposals below. Easner is a global personal and business finance product competing primarily in the US. Lead with everyday finances, accounts, and business operations; present international payments as a capability rather than the whole product. Remove repeated fee reminders from promotional copy, retaining fee information in its relevant FAQ. The homepage uses only the dashboard/tablet illustration. All five original personal-page images and their cover framing are restored. Mobile devices and narrow layouts prioritize app downloads; desktop web access remains available.


## Direction

Keep the current page structure and section order. Improve product mockups, rewrite copy around customer outcomes, and strengthen search accessibility within the existing pages. This is a refinement of the current site. All copy below is proposed copy, subject to checking that it accurately describes current product availability.

Retain the blue and warm neutral palette, heading typeface, rounded containers, existing navigation, account-selection dialog, product grid, audience tabs, corridor illustration, compliance section, FAQ section, and final CTA. Adjust wrapping, spacing, and image framing where needed to make the improvements work on mobile.

## Pass 1: Homepage copy and main mockup

### Hero

Proposed headline:

> Get paid globally.
> Move money with ease.

Proposed supporting copy:

> Receive international payments, send money abroad, and manage multiple currencies with Easner Personal and Business. See applicable fees and exchange rates before you confirm a transfer.

Retain “Open Account” and “Explore products.” Keep the account-selection dialog and make its opening line more direct: “Choose a personal or business account.” Use natural line wrapping at small widths rather than shrinking long headlines to fit a forced single line.

### Main mockup

Upgrade the current dashboard illustration and introduce a personal app view within the same visual slot. On desktop, use a business dashboard with a clearly visible personal phone screen beside or partially overlapping it. On mobile, adapt the arrangement into two readable views within the existing visual area; do not shrink a desktop dashboard until its labels become illegible.

The dashboard should show useful currency balances, an incoming invoice payment, and a supplier payout with a clear status. The personal screen should show receiving income or reviewing a transfer. Use the actual product's UI conventions, fictional demonstration records, and a discreet “Illustrative account” label. Clearly label any illustrative fees or rates. Do not depict unsupported account types, payment methods, processing speeds, or features.

### Existing homepage sections

- **Logo strip:** keep its placement and treatment. Verify each relationship, then use accurate wording. If logos represent providers, label the strip accordingly; do not imply they are customers. Use a broad label such as “Technology and payment providers” only when that accurately describes the listed relationships.
- **Why Easner:** change “Why teams choose Easner” to “Why choose Easner.” Keep the four pillars, rewriting them around managing money, reviewing costs, account verification, and sending or receiving payments. Retain numerical savings claims only when a linked, current comparison supports them.
- **Audience tabs:** keep all four tabs and their imagery. Shorten labels to “Personal,” “Business,” “Partners,” and “Developers.” Give personal and business equally concrete explanations and equally visible links. Avoid treating all personal users as freelancers.
- **Product grid:** retain every product and its position. Give each card one clear outcome and one distinguishing capability. Match any availability qualifiers to the corresponding product page, including phased card availability.
- **Corridor section:** retain the map. Proposed heading: “Global currencies. Local payments.” Explain both personal transfers and business payouts, separating payout coverage from eligibility to open an account.
- **Compliance section:** keep the section and underlying factual disclosures. Translate its introduction into plain language and make the existing policy link useful. Avoid language that implies blanket guarantees of safety or regulatory coverage.
- **FAQ:** retain the section, improve the wording, and prioritize customer questions about eligibility, costs, receiving money, transfer timing, verification, and Easner's role. Answers must use verified product facts.
- **Final CTA:** proposed headline: “Your next payment starts here.” Supporting copy: “Choose Easner Personal for your money, Easner Business for your operations, or talk to us about a partnership.” Keep existing destinations.

## Pass 2: A consistent product mockup system

Reuse and refine the existing React/CSS mockup approach in `website/components/marketing/visual-slot.tsx`. Establish shared frame, spacing, text, currency, status, and transaction-row treatments. Extract small reusable pieces only where they make the affected visuals easier to maintain; avoid an unrelated component rewrite.

Design rules:

- Use realistic information hierarchy: account or task title, amount, currency, recipient or payer, status, and next action.
- Replace unexplained black bars with meaningful demo content or clearly intentional masking.
- Make each visual demonstrate the feature described beside it.
- Use consistent demo records across related screens, with internally consistent amounts and statuses.
- Keep decorative motion subtle and respect reduced-motion preferences. Critical content must not depend on animation or interaction.
- Keep marketing illustrations non-interactive unless they actually perform an intended action; prevent fake controls from entering keyboard navigation.
- For existing personal screenshots, improve crop, scale, and frame first. Use `contain` where cropping removes information needed to understand the screen; retain lifestyle imagery where it already serves its purpose.

Screen assignments:

- **Personal:** receiving income, transfer review, saved recipients/EASETAG, and account security.
- **Business:** currency overview, supplier payout, collections, and team activity.
- **Invoicing:** invoice details beside a corresponding payment or reconciliation status.
- **Payment Links:** creating a link and its customer-facing payment page.
- **Checkout:** a recognizable purchase summary, available payment methods, and confirmation state.
- **Payroll:** payees, approval state, and payment progress. Match terminology to actual payroll capabilities.
- **Stablecoin:** asset and network clarity, receive/send details, and payment status.
- **Cards:** card and spending controls with visible availability qualifiers wherever needed.
- **Partners and Developers:** accurate program management and integration examples, with real supported concepts and no invented API endpoints.

Complete the homepage, personal, and business visuals first. Extend the approved visual treatment to the other existing pages afterward.

## Pass 3: Product-page copy

Keep each page's current hero, feature layout, use cases, and CTA sections. Replace broad infrastructure language with the specific task supported by that page. Retain technical detail where it helps developers or partners make a decision.

Proposed headline directions:

- Personal: “Get paid abroad. Manage your money at home.”
- Business: “Get paid by customers. Pay suppliers and teams.”
- Invoicing: “Send an invoice. Get paid across borders.”
- Payment Links: “Get paid with a link.”
- Checkout: “Accept payments on your website.”
- Payroll: “Pay your team across borders.”
- Stablecoin: “Send and receive stablecoins with ease.”
- Cards: “Manage spending with Easner cards.” Accompany with the actual rollout status.
- Partners: “Build cross-border payments under your brand.”
- Developers: “Build international payments into your product.”

Use existing descriptions, feature blocks, use cases, and FAQs to clarify currencies, eligibility, payment methods, fees, limits, and timing where facts are available. Do not add guessed prices or uniform settlement promises. Preserve meaningful differences between products and between personal and business capabilities.

## Pass 4: Search and answer accessibility

- Render FAQ answers in the page HTML before interaction. Keep the accordion appearance, allow question text to wrap, and provide appropriate disclosure semantics.
- Ensure important audience content and links can be discovered without clicking tabs; check the rendered HTML and use the existing dedicated product pages as the full destination for each audience.
- Rewrite titles and descriptions to match each page's actual purpose. Proposed homepage title: “Easner | International Payments for Personal & Business.” Avoid duplicating the same description across pages.
- Keep canonical URLs, social previews, sitemap, robots rules, and internal destinations working. Update sitemap dates only for materially changed pages.
- Keep structured data consistent with visible content. Represent account availability and payout destinations accurately rather than using broad location markup as keyword targeting.
- Update the existing `llms.txt` to reflect final copy, without treating it as a ranking shortcut.
- Add relevant internal links inside existing descriptions and FAQ answers where a product or policy page answers the next question.
- Profile mobile loading and interaction performance; optimize fonts, images, motion, or third-party scripts only where measurements justify changes.

Reference: [Google's generative AI search guidance](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide), [Google's metadata guidance](https://developers.google.com/search/docs/crawling-indexing/special-tags), and [Google's guidance on interaction-dependent content](https://developers.google.com/search/docs/specialty/ecommerce/pagination-and-incremental-page-loading). Useful visible content and crawlable pages take priority over meta-keyword lists or additional AI-specific files.

## Pass 5: Verification and measurement

Definition of done:

- Existing sections and their order remain recognizable, with working navigation and CTA destinations.
- The homepage copy and main illustration visibly serve both personal and business users.
- Every changed mockup explains its adjacent feature and remains readable at representative 360px, 390px, 768px, and desktop widths.
- No clipped headlines, truncated FAQ questions, overlapping controls, or unnecessary horizontal scrolling.
- Keyboard access, disclosure behavior, focus visibility, alt text, contrast, and reduced motion receive targeted checks.
- Search metadata and initial HTML contain the intended content; structured data remains accurate.
- Run the applicable build, lint, and TypeScript checks, distinguishing pre-existing failures from introduced issues. A passing build alone is insufficient because the current configuration ignores TypeScript build errors.
- Preserve existing analytics event names and locations unless a deliberate migration is needed. Verify original organic attribution survives the website-to-app journey; do not count internal referrals as new acquisition.
- Record a baseline before release, then compare personal and business CTA engagement, signup completion, verification, and first successful transactions where data is available. Review search impressions and clicks separately. Avoid attributing small or short-term fluctuations to the redesign without sufficient evidence.

## Subsequent growth work

New pricing pages, a country directory, a resources hub, dedicated search landing pages, customer case studies, and larger navigation changes belong in a subsequent scope. This first release improves discovery and conversion using existing pages; sustained organic acquisition will still require useful content and external credibility over time.

## Suggested implementation sequence

1. Prepare the revised homepage copy and desktop/mobile hero mockup together as the first reviewable result.
2. Apply the same treatment to Personal and Business, refining their existing feature mockups and copy equally.
3. Extend the shared design treatment and outcome-focused copy to the remaining product pages.
4. Complete search accessibility, metadata, responsive checks, and attribution verification.
5. Review the finished changes and validation evidence before deployment.

This document is a plan; it does not change the website or authorize deployment.


## Implementation and local validation — September 5, 2026

Implemented in the working tree across the homepage and ten existing product pages. The page structure and navigation are retained. Homepage and personal account illustrations, business dashboards, invoices, checkout, payment links, payroll, stablecoin, cards, and developer workflows now use clearer demonstration content. Personal feature screenshots and audience photography remain in use. Copy, metadata, FAQ rendering, audience-tab semantics, related links, reduced-motion styles, and outbound attribution were updated.

Validation completed:

- Production build passed, generating all 43 static outputs. The existing configuration skips type checking during builds, so TypeScript was also run separately.
- Checked all 11 changed pages at 360px, 390px, 768px, and 1280px. Corrected clipped mockups and retested affected pages; no remaining page overflow or clipped mockup content in those checks.
- Verified FAQ disclosure, arrow-key audience selection, product-anchor scrolling, account chooser focus wrapping, nested download-dialog focus, Escape handling, and focus restoration. The QA tab recorded no console errors on its final page.
- Parsed generated HTML for all 11 pages: unique titles and descriptions, one H1 each, canonical URLs, parseable JSON-LD, 21 FAQ answers matching their schema, all four homepage audience panels present before interaction, and 122 internal links resolving to existing pages or public assets.
- Checked JSON-LD script escaping and serialization round-trip. Checked attribution with organic, campaign-tagged, and subsequent-page visits: internal CTA placement stays separate, real UTMs are forwarded, and the original referrer is retained.
- ESLint on changed TypeScript files: zero errors and two existing unused-parameter warnings. Full website lint still reports three existing errors in `hooks/use-download-platform.ts` and eight warnings.
- Standalone TypeScript reports 21 existing errors, down from the 24-error baseline, with no new diagnostics. Remaining failures concern duplicate React type definitions, header SVG props, and an optional card-link URL.
- `git diff --check` passed.

Changes are local and have not been deployed. Production Core Web Vitals, search impressions/clicks, and the personal/business conversion baseline still need to be recorded for the release comparison; this local validation does not establish an organic traffic uplift. Existing infrastructure logos were retained with a more accurate category label; individual commercial relationships were not independently reverified during implementation.


## User-requested revision validation

Updated homepage, Personal, Business, About, invoicing, payroll, shared messaging, metadata, and llms.txt to reflect the broader positioning. Removed the coded personal phone component and restored the original personal image mapping and framing. Mobile web-access visibility now uses both device detection and layout width, including the download page and nested dialog.

Production build and website lint passed (eight existing lint warnings, zero errors). Checked six revised pages at four widths, with no page overflow or clipped mockup content. Confirmed all five personal images use their original cover framing. Mobile personal CTAs and both dialogs show no Web App link; desktop retains web access. Platform checks covered iPhone, Android, iPad, narrow desktop previews, and desktop. The existing unresponsive development server was restarted on localhost:3000. These corrections remain local and have not been deployed.


Latest Personal page refinement: keep the original hero image and restore its original cover framing on mobile and larger screens. The final CTA heading is “Wherever life takes you.” Its device-specific helper copy uses the shared CTA subheading typography. Rename the recipients feature heading to “Quick sending.” Verified Personal and Business CTA text match at 16px/28px on a 390px viewport and 24px/32px on a 1280px viewport.

Restore the original hero headings “Bank globally with Ease” and “Global banking for business.” Use brand-first SEO titles for Personal and Business, with no duplicate brand suffix. The homepage audience tabs are “Personal Banking,” “Business Banking,” “Deploy Easner,” and “Easner API”; retain their destinations, section spacing, and the existing individual product cards.

## SEO revision — September 5, 2026

Reviewed all 18 public pages against the committed source and generated production HTML. The homepage title is now “Easner | Global Banking, Payments & Multi-Currency Accounts.” Personal and Business retain their full product names first: “Easner Personal Banking | Multi-Currency Money App” and “Easner Business Banking | Accounts, Payments & Payouts.” Product metadata now describes each page's specific purpose, including virtual/physical cards, online checkout, global payroll, online invoicing, embedded banking/payment APIs, and white-label payments. Titles are concise editorial choices, not a promise of fixed search-result truncation or rankings.

Root metadata uses the same homepage source to prevent drift. Removed duplicate brand suffixes on About and Partners and duplicate branding on account deletion. Updated Personal, Business, Checkout, and Developer service descriptions to match their current product positioning; linked WebSite and Organization identities consistently. Existing canonical URLs, index/follow rules, sitemap coverage, download crawler handling, FAQ content rendering, and social images were retained and checked. Visible hero headings, images, product cards, and CTA copy were not changed in this SEO pass.

Validation: production build passed; `npm run check:seo --workspace=website` checks all 18 pages for unique titles/descriptions, one H1, canonical and social metadata consistency, indexing restrictions, generated social image files, parseable structured data, 21 FAQ answers in HTML, internal link destinations, and sitemap/robots output. Changed-file lint passed with two existing warnings. Standalone TypeScript still has the same 21 existing diagnostics, with no new error signatures. The reusable SEO check requires Python 3 and a completed production build.

Guidance: [Google title links](https://developers.google.com/search/docs/appearance/title-link), [search snippets](https://developers.google.com/search/docs/appearance/snippet), [structured data policies](https://developers.google.com/search/docs/appearance/structured-data/sd-policies), and [AI search features](https://developers.google.com/search/docs/appearance/ai-features). These local changes have not been deployed. Search Console indexing, query impressions, and ranking changes require production measurement after release.
